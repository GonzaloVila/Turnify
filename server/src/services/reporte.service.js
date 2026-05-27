const prisma = require('../config/db');
const { startOfMonth, endOfMonth, subMonths, format } = require('date-fns');

async function resumenMes(negocio_id) {
  const inicio = startOfMonth(new Date());
  const fin = endOfMonth(new Date());

  const turnos = await prisma.turno.findMany({
    where: { negocio_id, fecha_hora_inicio: { gte: inicio, lte: fin } },
    include: { profesional: { select: { id: true, nombre: true } } },
  });

  const porEstado = turnos.reduce((acc, t) => {
    acc[t.estado] = (acc[t.estado] || 0) + 1;
    return acc;
  }, {});

  const porProfesional = turnos.reduce((acc, t) => {
    const key = t.profesional.nombre;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return { total: turnos.length, porEstado, porProfesional };
}

async function ingresosPorMes(negocio_id, meses = 6) {
  const resultados = [];

  for (let i = meses - 1; i >= 0; i--) {
    const fecha = subMonths(new Date(), i);
    const inicio = startOfMonth(fecha);
    const fin = endOfMonth(fecha);

    const turnos = await prisma.turno.findMany({
      where: { negocio_id, estado: 'COMPLETADO', fecha_hora_inicio: { gte: inicio, lte: fin } },
      include: { servicio: { select: { precio: true } } },
    });

    const total = turnos.reduce((sum, t) => sum + Number(t.servicio?.precio || 0), 0);
    resultados.push({ mes: format(fecha, 'yyyy-MM'), total, cantidad: turnos.length });
  }

  return resultados;
}

async function clientesNuevosPorMes(negocio_id, meses = 6) {
  const resultados = [];

  for (let i = meses - 1; i >= 0; i--) {
    const fecha = subMonths(new Date(), i);
    const inicio = startOfMonth(fecha);
    const fin = endOfMonth(fecha);

    const count = await prisma.cliente.count({
      where: { negocio_id, created_at: { gte: inicio, lte: fin } },
    });

    resultados.push({ mes: format(fecha, 'yyyy-MM'), count });
  }

  return resultados;
}

module.exports = { resumenMes, ingresosPorMes, clientesNuevosPorMes };
