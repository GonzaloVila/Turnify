const prisma = require('../config/db');

async function listar(negocio_id, search) {
  const where = { negocio_id };
  if (search) {
    where.OR = [
      { nombre: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { telefono: { contains: search } },
    ];
  }
  return prisma.cliente.findMany({ where, orderBy: { nombre: 'asc' } });
}

async function obtener(id, negocio_id) {
  const cliente = await prisma.cliente.findFirst({
    where: { id, negocio_id },
    include: {
      turnos: {
        include: { servicio: true, profesional: true },
        orderBy: { fecha_hora_inicio: 'desc' },
      },
    },
  });
  if (!cliente) throw Object.assign(new Error('Cliente no encontrado'), { statusCode: 404 });
  return cliente;
}

async function buscarOCrear(negocio_id, { nombre, email, telefono }) {
  if (email) {
    const existente = await prisma.cliente.findFirst({ where: { negocio_id, email } });
    if (existente) return existente;
  }
  return prisma.cliente.create({ data: { negocio_id, nombre, email, telefono } });
}

async function crear(negocio_id, data) {
  return prisma.cliente.create({ data: { ...data, negocio_id } });
}

async function actualizar(id, negocio_id, data) {
  await obtener(id, negocio_id);
  return prisma.cliente.update({ where: { id }, data });
}

async function eliminar(id, negocio_id) {
  await obtener(id, negocio_id);
  return prisma.cliente.delete({ where: { id } });
}

module.exports = { listar, obtener, buscarOCrear, crear, actualizar, eliminar };
