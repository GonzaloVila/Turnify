const prisma = require('../config/db');

async function listar() {
  return prisma.negocio.findMany({ orderBy: { created_at: 'desc' } });
}

async function obtener(id) {
  const negocio = await prisma.negocio.findUnique({ where: { id } });
  if (!negocio) throw Object.assign(new Error('Negocio no encontrado'), { statusCode: 404 });
  return negocio;
}

async function actualizar(id, data) {
  return prisma.negocio.update({ where: { id }, data });
}

async function eliminar(id) {
  return prisma.negocio.delete({ where: { id } });
}

module.exports = { listar, obtener, actualizar, eliminar };
