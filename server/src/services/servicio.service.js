const prisma = require('../config/db');

async function listar(negocio_id) {
  return prisma.servicio.findMany({
    where: { negocio_id, activo: true },
    orderBy: { nombre: 'asc' },
  });
}

async function obtener(id, negocio_id) {
  const servicio = await prisma.servicio.findFirst({ where: { id, negocio_id } });
  if (!servicio) throw Object.assign(new Error('Servicio no encontrado'), { statusCode: 404 });
  return servicio;
}

async function crear(negocio_id, data) {
  return prisma.servicio.create({ data: { ...data, negocio_id } });
}

async function actualizar(id, negocio_id, data) {
  await obtener(id, negocio_id);
  return prisma.servicio.update({ where: { id }, data });
}

async function desactivar(id, negocio_id) {
  await obtener(id, negocio_id);
  return prisma.servicio.update({ where: { id }, data: { activo: false } });
}

module.exports = { listar, obtener, crear, actualizar, desactivar };
