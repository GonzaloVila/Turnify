const { z } = require('zod');

const crearTurnoSchema = z.object({
  profesional_id: z.string().uuid('ID de profesional inválido'),
  servicio_id: z.string().uuid('ID de servicio inválido'),
  cliente_id: z.string().uuid('ID de cliente inválido').optional(),
  fecha_hora_inicio: z.string().datetime('Fecha y hora de inicio inválida'),
  notas: z.string().optional(),
  cliente: z
    .object({
      nombre: z.string().min(1),
      email: z.string().email().optional(),
      telefono: z.string().optional(),
    })
    .optional(),
});

const cambiarEstadoSchema = z.object({
  estado: z.enum(['PENDIENTE', 'CONFIRMADO', 'CANCELADO', 'COMPLETADO', 'AUSENTE']),
});

module.exports = { crearTurnoSchema, cambiarEstadoSchema };
