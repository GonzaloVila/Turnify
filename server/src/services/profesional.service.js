const prisma = require('../config/db');

async function listar(negocio_id) {
  return prisma.profesional.findMany({
    where: { negocio_id, activo: true },
    include: { horarios: { where: { activo: true } } },
    orderBy: { nombre: 'asc' },
  });
}

async function obtener(id, negocio_id) {
  const profesional = await prisma.profesional.findFirst({
    where: { id, negocio_id },
    include: { horarios: { where: { activo: true } } },
  });
  if (!profesional) throw Object.assign(new Error('Profesional no encontrado'), { statusCode: 404 });
  return profesional;
}

async function crear(negocio_id, data) {
  return prisma.profesional.create({ data: { ...data, negocio_id } });
}

async function actualizar(id, negocio_id, data) {
  await obtener(id, negocio_id);
  return prisma.profesional.update({ where: { id }, data });
}

async function desactivar(id, negocio_id) {
  await obtener(id, negocio_id);
  return prisma.profesional.update({ where: { id }, data: { activo: false } });
}

module.exports = { listar, obtener, crear, actualizar, desactivar };
