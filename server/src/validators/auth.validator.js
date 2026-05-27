const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const registerSchema = z.object({
  nombre_negocio: z.string().min(2, 'El nombre del negocio es requerido'),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  email_negocio: z.string().email('Email del negocio inválido'),
  nombre_usuario: z.string().min(2, 'El nombre del usuario es requerido'),
  email_usuario: z.string().email('Email del usuario inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

module.exports = { loginSchema, registerSchema };
