const prisma = require('../config/db');
const { calcularFin, hayConflicto } = require('../utils/dateHelpers');
const { buscarOCrear } = require('./cliente.service');
const { parseISO, startOfDay, endOfDay } = require('date-fns');

const INCLUDE_FULL = {
  profesional: true,
  servicio: true,
  cliente: true,
};

async function listar(negocio_id, { fecha, profesional_id, estado }) {
  const where = { negocio_id };
  if (profesional_id) where.profesional_id = profesional_id;
  if (estado) where.estado = estado;
  if (fecha) {
    const d = parseISO(fecha);
    where.fecha_hora_inicio = { gte: startOfDay(d), lte: endOfDay(d) };
  }
  return prisma.turno.findMany({
    where,
    include: INCLUDE_FULL,
    orderBy: { fecha_hora_inicio: 'asc' },
  });
}

async function obtener(id, negocio_id) {
  const turno = await prisma.turno.findFirst({
    where: { id, negocio_id },
    include: INCLUDE_FULL,
  });
  if (!turno) throw Object.assign(new Error('Turno no encontrado'), { statusCode: 404 });
  return turno;
}

async function crear(negocio_id, data, origen = 'MANUAL') {
  const { profesional_id, servicio_id, cliente_id, fecha_hora_inicio, notas, cliente: clienteData } = data;

  const servicio = await prisma.servicio.findFirst({ where: { id: servicio_id, negocio_id } });
  if (!servicio) throw Object.assign(new Error('Servicio no encontrado'), { statusCode: 404 });

  const inicio = new Date(fecha_hora_inicio);
  const fin = calcularFin(inicio, servicio.duracion_min);

  const conflictos = await prisma.turno.findMany({
    where: {
      profesional_id,
      estado: { notIn: ['CANCELADO'] },
      fecha_hora_inicio: { lt: fin },
      fecha_hora_fin: { gt: inicio },
    },
  });

  if (conflictos.length > 0) {
    throw Object.assign(new Error('El profesional ya tiene un turno en ese horario'), { statusCode: 409 });
  }

  let resolvedClienteId = cliente_id;
  if (!resolvedClienteId && clienteData) {
    const cliente = await buscarOCrear(negocio_id, clienteData);
    resolvedClienteId = cliente.id;
  }

  if (!resolvedClienteId) {
    throw Object.assign(new Error('Se requiere cliente_id o datos del cliente'), { statusCode: 400 });
  }

  return prisma.turno.create({
    data: {
      negocio_id,
      profesional_id,
      servicio_id,
      cliente_id: resolvedClienteId,
      fecha_hora_inicio: inicio,
      fecha_hora_fin: fin,
      notas,
      origen,
    },
    include: INCLUDE_FULL,
  });
}

async function cambiarEstado(id, negocio_id, estado) {
  await obtener(id, negocio_id);
  return prisma.turno.update({ where: { id }, data: { estado }, include: INCLUDE_FULL });
}

async function eliminar(id, negocio_id) {
  await obtener(id, negocio_id);
  return prisma.turno.delete({ where: { id } });
}

module.exports = { listar, obtener, crear, cambiarEstado, eliminar };
