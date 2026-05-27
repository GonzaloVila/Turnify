const { z } = require('zod');

const actualizarNegocioSchema = z.object({
  nombre: z.string().min(2).optional(),
  email: z.string().email().optional(),
  telefono: z.string().optional(),
  descripcion: z.string().optional(),
  direccion: z.string().optional(),
  logo_url: z.string().url().optional(),
});

module.exports = { actualizarNegocioSchema };
