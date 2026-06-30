const prisma = require('../config/db');
const { getProvider, getGeminiModel, getGroqClient, GROQ_MODEL } = require('../config/llm');
const { tools, geminiTools, dispatchTool } = require('./chat-tools.service');

const GROQ_CHAT_TOOLS = tools.filter((t) =>
  ['check_availability', 'book_appointment'].includes(t.function.name)
);

const GEMINI_CHAT_TOOLS = [{
  functionDeclarations: geminiTools[0].functionDeclarations.filter((d) =>
    ['check_availability', 'book_appointment'].includes(d.name)
  ),
}];

async function buildSystemPrompt(negocio) {
  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const [servicios, profesionales] = await Promise.all([
    prisma.servicio.findMany({
      where: { negocio_id: negocio.id, activo: true },
      select: { id: true, nombre: true, duracion_min: true, precio: true },
    }),
    prisma.profesional.findMany({
      where: { negocio_id: negocio.id, activo: true },
      select: { id: true, nombre: true, especialidad: true },
    }),
  ]);

  const srvList = servicios
    .map((s) => `  - "${s.nombre}" | ID: ${s.id} | ${s.duracion_min} min | $${Number(s.precio || 0).toLocaleString()}`)
    .join('\n');

  const profList = profesionales
    .map((p) => `  - "${p.nombre}" | ID: ${p.id} | ${p.especialidad || 'General'}`)
    .join('\n');

  return `Sos el asistente de reservas de ${negocio.nombre}. Hoy es ${today}.

Ya tenés los datos del negocio cargados. NO necesitás llamar ninguna tool para obtener servicios ni profesionales.

SERVICIOS DISPONIBLES:
${srvList}

PROFESIONALES DISPONIBLES:
${profList}

SALUDO INICIAL:
Respondé SOLO: "Hola, soy el asistente de ${negocio.nombre}. ¿En qué puedo ayudarte?"
NO llames ninguna tool. Esperá a que el cliente hable.

FLUJO — avanzá siempre al paso siguiente, nunca preguntes si quiere reservar ni si quiere saber más:
1. Si el cliente nombra un servicio → confirmá el servicio con precio y duración, y EN EL MISMO MENSAJE preguntá con cuál profesional quiere atenderse mostrando las opciones.
2. Si NO nombró servicio → preguntá qué servicio busca.
3. Cuando elija profesional → preguntá para qué día. NO llames tools.
4. Cuando diga el día → llamá check_availability y mostrá los horarios disponibles.
5. Cuando elija horario → pedí nombre y teléfono.
6. Cuando tenga todo → resumí y preguntá si confirma.
7. Cuando confirme → llamá book_appointment y respondé: "¡Listo! Tu turno quedó reservado: [servicio] con [profesional] el [fecha] a las [hora]. ¡Te esperamos!"

Si pregunta qué servicios hay → mostrá la lista completa y preguntá cuál quiere.

REGLAS:
- Usá los IDs EXACTOS de las listas de arriba cuando llames check_availability o book_appointment.
- Ignorá tildes y mayúsculas al comparar (ej: "martin" = "Martin Lopez", "corte" = "Corte de cabello").
- Si la hora es solo un número (ej: "14"), interpretalo como "14:00".
- Convertí la fecha del cliente a YYYY-MM-DD.
- NUNCA menciones IDs, UUIDs ni códigos al cliente.
- Español argentino, tono amigable.
- Máximo 2-3 líneas por respuesta. Una sola pregunta por turno.`;
}

// ── Gemini implementation ──

async function* streamChatGemini(negocio, messages) {
  const systemPrompt = await buildSystemPrompt(negocio);
  const model = getGeminiModel();

  const chat = model.startChat({
    systemInstruction: { parts: [{ text: systemPrompt }] },
    tools: GEMINI_CHAT_TOOLS,
    history: messages.slice(0, -1).map(geminiMsg),
  });

  const lastMsg = messages[messages.length - 1];
  let response = await chat.sendMessage(lastMsg.content);

  while (true) {
    const candidate = response.response.candidates?.[0];
    if (!candidate) break;

    const parts = candidate.content?.parts || [];
    let hasToolCalls = false;
    const toolResults = [];

    for (const part of parts) {
      if (part.text) {
        yield { type: 'text-delta', delta: part.text };
      }

      if (part.functionCall) {
        hasToolCalls = true;
        const name = part.functionCall.name;
        const args = part.functionCall.args || {};

        yield { type: 'tool-call', name, input: args };

        let result;
        try {
          result = await dispatchTool(name, args, negocio.id);
        } catch (err) {
          result = { error: err.message };
        }

        yield { type: 'tool-result', name, result };

        toolResults.push({
          functionResponse: { name, response: result },
        });
      }
    }

    if (!hasToolCalls) break;

    response = await chat.sendMessage(toolResults);
  }

  yield { type: 'done' };
}

function geminiMsg(m) {
  return {
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  };
}

// ── Groq implementation ──

function sanitizeToolCalls(rawCalls) {
  return rawCalls.map((tc) => {
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

async function* streamChatGroq(negocio, messages) {
  const systemPrompt = await buildSystemPrompt(negocio);
  const client = getGroqClient();

  const allMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  const baseParams = {
    model: GROQ_MODEL,
    messages: allMessages,
    tools: GROQ_CHAT_TOOLS,
    tool_choice: 'auto',
    max_tokens: 1024,
  };

  while (true) {
    let accumulatedContent = '';
    let finishReason = null;
    let toolCalls = null;

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

// ── Router ──

async function* streamChat(negocio, messages) {
  const provider = getProvider();
  if (provider === 'gemini') {
    yield* streamChatGemini(negocio, messages);
  } else {
    yield* streamChatGroq(negocio, messages);
  }
}

async function resolveNegocio(slug) {
  const negocio = await prisma.negocio.findUnique({ where: { slug } });
  if (!negocio) throw Object.assign(new Error('Negocio no encontrado'), { statusCode: 404 });
  return negocio;
}

module.exports = { streamChat, resolveNegocio };
