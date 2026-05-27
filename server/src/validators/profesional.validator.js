const { z } = require('zod');

const crearProfesionalSchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido'),
  especialidad: z.string().optional(),
  telefono: z.string().optional(),
  avatar_url: z.string().url().optional(),
  usuario_id: z.string().uuid().optional(),
});

const actualizarProfesionalSchema = crearProfesionalSchema.partial();

module.exports = { crearProfesionalSchema, actualizarProfesionalSchema };
