const prisma = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');

async function login(email, password) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !usuario.activo) {
    throw Object.assign(new Error('Credenciales inválidas'), { statusCode: 401 });
  }

  const valid = await comparePassword(password, usuario.password_hash);
  if (!valid) {
    throw Object.assign(new Error('Credenciales inválidas'), { statusCode: 401 });
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { ultimo_login: new Date() },
  });

  const token = generateToken({
    id: usuario.id,
    negocio_id: usuario.negocio_id,
    rol: usuario.rol,
  });

  const { password_hash, ...usuarioSafe } = usuario;
  return { token, usuario: usuarioSafe };
}

async function register({ nombre_negocio, slug, email_negocio, nombre_usuario, email_usuario, password }) {
  const count = await prisma.negocio.count();
  const hash = await hashPassword(password);

  const result = await prisma.$transaction(async (tx) => {
    const negocio = await tx.negocio.create({
      data: { nombre: nombre_negocio, email: email_negocio, slug },
    });

    const usuario = await tx.usuario.create({
      data: {
        negocio_id: negocio.id,
        nombre: nombre_usuario,
        email: email_usuario,
        password_hash: hash,
        rol: count === 0 ? 'SUPER_ADMIN' : 'ADMIN',
      },
    });

    const { password_hash, ...usuarioSafe } = usuario;
    return { negocio, usuario: usuarioSafe };
  });

  return result;
}

async function me(id) {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      negocio_id: true,
      activo: true,
      ultimo_login: true,
      negocio: { select: { id: true, nombre: true, slug: true, logo_url: true } },
    },
  });
  if (!usuario) throw Object.assign(new Error('Usuario no encontrado'), { statusCode: 404 });
  return usuario;
}

module.exports = { login, register, me };
