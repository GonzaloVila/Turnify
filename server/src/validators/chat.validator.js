const { z } = require('zod');

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1),
      })
    )
    .min(1, 'Se requiere al menos un mensaje')
    .max(50, 'El historial no puede tener más de 50 mensajes'),
});

module.exports = { chatSchema };
