const prisma = require('../config/db');
const { getClient, MODEL } = require('../config/llm');
const { tools, dispatchTool } = require('./chat-tools.service');

async function buildSystemPrompt(negocio) {
  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return `Sos el asistente de reservas de ${negocio.nombre}. Hoy es ${today}.

Al saludar, presentate brevemente y llamá list_services de inmediato sin pedir más input.

FLUJO — un estado por mensaje, avanzá según lo que aún te falta recolectar:

ESTADO 1 — Falta servicio:
  Llamá list_services → mostrá nombres numerados → preguntá cuál quiere.

ESTADO 2 — Falta profesional:
  Llamá list_professionals → mostrá nombres numerados → preguntá cuál prefiere.

ESTADO 3 — Falta fecha:
  Solo texto: "¿Para qué día querés el turno?" — NO llamés ninguna tool. Esperá la fecha.

ESTADO 4 — Falta horario (ya tenés fecha del cliente):
  Llamá check_availability con los IDs exactos y la fecha → mostrá horarios → preguntá cuál elige.

ESTADO 5 — Falta nombre y teléfono:
  Solo texto: pedí nombre completo y teléfono — NO llamés ninguna tool.

ESTADO 6 — Tenés todo:
  Solo texto: "¿Reservamos [servicio] con [profesional] el [fecha] a las [hora] para [nombre]?"

ESTADO 7 — Cliente confirmó:
  Llamá book_appointment → respondé EXACTAMENTE y SOLO: "¡Listo! Tu turno quedó reservado: [servicio] con [profesional] el [fecha] a las [hora]. ¡Te esperamos!"

REGLAS:
- Nunca avancés al ESTADO 4 sin haber recibido la fecha del cliente en este mismo chat.
- Los IDs son los que devuelve la tool. Usálos exactamente como vinieron, sin modificarlos.
- Si el cliente indica la hora solo con el número (ej: "14"), interpretalo como "14:00".
- Convertí la fecha del cliente a YYYY-MM-DD antes de llamar check_availability.
- Nunca menciones IDs, códigos ni UUIDs al cliente.
- Español argentino. Máximo 2 líneas por respuesta. Una sola pregunta por turno.`;
}

function sanitizeToolCalls(rawCalls) {
  return rawCalls.map((tc) => {
    // Strip model artifacts from tool name:
    //   "name<|token|>text"  → split on <|
    //   "name={"args"}"      → split on =
    //   "name {"args"}"      → split on first space, recover embedded args
    let raw = tc.function.name.split('<|')[0].split('=')[0];
    let recoveredArgs = null;
    const spaceIdx = raw.indexOf(' ');
    if (spaceIdx !== -1) {
      const tail = raw.slice(spaceIdx).trim();
      raw = raw.slice(0, spaceIdx);
      try { recoveredArgs = JSON.parse(tail); } catch { /* ignore */ }
    }
    const cleanName = raw.trim();
    const cleanArgs = (!tc.function.arguments || tc.function.arguments === '{}')
      ? (recoveredArgs ? JSON.stringify(recoveredArgs) : tc.function.arguments)
      : tc.function.arguments;
    return { ...tc, function: { ...tc.function, name: cleanName, arguments: cleanArgs } };
  });
}

async function* streamChat(negocio, messages) {
  const systemPrompt = await buildSystemPrompt(negocio);
  const client = getClient();

  const allMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  const baseParams = {
    model: MODEL,
    messages: allMessages,
    tools,
    tool_choice: 'auto',
    max_tokens: 1024,
  };

  while (true) {
    let accumulatedContent = '';
    let finishReason = null;
    let toolCalls = null;

    // Attempt streaming — best UX for text responses
    try {
      const toolCallsMap = {};
      const stream = await client.chat.completions.create({ ...baseParams, stream: true });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        finishReason = chunk.choices[0]?.finish_reason ?? finishReason;

        if (delta?.content) {
          accumulatedContent += delta.content;
          yield { type: 'text-delta', delta: delta.content };
        }

        if (delta?.tool_calls) {
          for (const tc of delta.tool_calls) {
            if (!toolCallsMap[tc.index]) {
              toolCallsMap[tc.index] = { id: '', type: 'function', function: { name: '', arguments: '' } };
            }
            const entry = toolCallsMap[tc.index];
            if (tc.id) entry.id = tc.id;
            if (tc.function?.name) entry.function.name += tc.function.name;
            if (tc.function?.arguments) entry.function.arguments += tc.function.arguments;
          }
        }
      }

      if (finishReason === 'tool_calls') {
        toolCalls = sanitizeToolCalls(Object.values(toolCallsMap));
      }
    } catch (err) {
      // Groq rejects malformed tool names mid-stream — retry without streaming to recover
      if (!err.message?.toLowerCase().includes('tool call validation')) throw err;

      accumulatedContent = '';
      const response = await client.chat.completions.create({ ...baseParams, stream: false });
      const choice = response.choices[0];
      finishReason = choice.finish_reason;

      if (choice.message.content) {
        accumulatedContent = choice.message.content;
        yield { type: 'text-delta', delta: accumulatedContent };
      }

      if (finishReason === 'tool_calls') {
        toolCalls = sanitizeToolCalls(choice.message.tool_calls || []);
      }
    }

    if (finishReason !== 'tool_calls') break;

    allMessages.push({
      role: 'assistant',
      content: accumulatedContent || null,
      tool_calls: toolCalls,
    });

    for (const tc of toolCalls) {
      let args;
      try { args = JSON.parse(tc.function.arguments); } catch { args = {}; }

      yield { type: 'tool-call', name: tc.function.name, input: args };

      let result;
      try {
        result = await dispatchTool(tc.function.name, args, negocio.id);
      } catch (err) {
        result = { error: err.message };
      }

      yield { type: 'tool-result', name: tc.function.name, result };

      allMessages.push({
        role: 'tool',
        tool_call_id: tc.id,
        content: JSON.stringify(result),
      });
    }
  }

  yield { type: 'done' };
}

async function resolveNegocio(slug) {
  const negocio = await prisma.negocio.findUnique({ where: { slug } });
  if (!negocio) throw Object.assign(new Error('Negocio no encontrado'), { statusCode: 404 });
  return negocio;
}

module.exports = { streamChat, resolveNegocio };
