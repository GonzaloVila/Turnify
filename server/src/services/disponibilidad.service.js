const prisma = require('../config/db');
const { getSlotsDisponibles } = require('../utils/dateHelpers');
const { parseISO, startOfDay, endOfDay } = require('date-fns');

async function obtenerSlots(profesional_id, servicio_id, fecha) {
  const [profesional, servicio] = await Promise.all([
    prisma.profesional.findUnique({
      where: { id: profesional_id },
      include: { horarios: { where: { activo: true } } },
    }),
    prisma.servicio.findUnique({ where: { id: servicio_id } }),
  ]);

  if (!profesional) throw Object.assign(new Error('Profesional no encontrado'), { statusCode: 404 });
  if (!servicio) throw Object.assign(new Error('Servicio no encontrado'), { statusCode: 404 });

  const fechaDate = parseISO(fecha);

  const turnosExistentes = await prisma.turno.findMany({
    where: {
      profesional_id,
      fecha_hora_inicio: { gte: startOfDay(fechaDate), lte: endOfDay(fechaDate) },
      estado: { notIn: ['CANCELADO'] },
    },
  });

  const slots = getSlotsDisponibles(
    profesional.horarios,
    turnosExistentes,
    servicio.duracion_min,
    fechaDate
  );

  return { slots, servicio: { nombre: servicio.nombre, duracion_min: servicio.duracion_min } };
}

module.exports = { obtenerSlots };
