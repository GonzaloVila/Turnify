const { streamChat, resolveNegocio } = require('../services/chat.service');

async function chat(req, res) {
  const { slug } = req.params;
  const { messages } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const send = (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  try {
    const negocio = await resolveNegocio(slug);
    for await (const event of streamChat(negocio, messages)) {
      send(event);
    }
  } catch (err) {
    console.error('[chat]', err?.message, err?.status, err?.errorDetails ?? '');
    send({ type: 'error', message: err.message || 'Error interno del servidor' });
  } finally {
    res.end();
  }
}

module.exports = { chat };
