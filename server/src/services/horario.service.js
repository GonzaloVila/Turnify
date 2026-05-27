const prisma = require('../config/db');

async function listarPorProfesional(profesional_id) {
  return prisma.horarioDisponible.findMany({
    where: { profesional_id, activo: true },
    orderBy: [{ dia_semana: 'asc' }, { hora_inicio: 'asc' }],
  });
}

async function crear(data) {
  return prisma.horarioDisponible.create({ data });
}

async function actualizar(id, data) {
  const horario = await prisma.horarioDisponible.findUnique({ where: { id } });
  if (!horario) throw Object.assign(new Error('Horario no encontrado'), { statusCode: 404 });
  return prisma.horarioDisponible.update({ where: { id }, data });
}

async function eliminar(id) {
  const horario = await prisma.horarioDisponible.findUnique({ where: { id } });
  if (!horario) throw Object.assign(new Error('Horario no encontrado'), { statusCode: 404 });
  return prisma.horarioDisponible.update({ where: { id }, data: { activo: false } });
}

module.exports = { listarPorProfesional, crear, actualizar, eliminar };
