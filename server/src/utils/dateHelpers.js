const { addMinutes, areIntervalsOverlapping, parseISO, format, setHours, setMinutes } = require('date-fns');

function calcularFin(inicio, duracionMin) {
  const inicioDate = inicio instanceof Date ? inicio : new Date(inicio);
  return addMinutes(inicioDate, duracionMin);
}

function hayConflicto(inicio1, fin1, inicio2, fin2) {
  return areIntervalsOverlapping(
    { start: new Date(inicio1), end: new Date(fin1) },
    { start: new Date(inicio2), end: new Date(fin2) },
    { inclusive: false }
  );
}

function getSlotsDisponibles(horarios, turnosExistentes, duracionMin, fecha) {
  const fechaBase = fecha instanceof Date ? fecha : parseISO(fecha);
  const diaSemana = fechaBase.getDay();

  const horariosDelDia = horarios.filter(
    (h) => h.dia_semana === diaSemana && h.activo
  );

  const slots = [];

  for (const horario of horariosDelDia) {
    const [hInicio, mInicio] = horario.hora_inicio.split(':').map(Number);
    const [hFin, mFin] = horario.hora_fin.split(':').map(Number);

    let cursor = setMinutes(setHours(new Date(fechaBase), hInicio), mInicio);
    const limite = setMinutes(setHours(new Date(fechaBase), hFin), mFin);

    while (addMinutes(cursor, duracionMin) <= limite) {
      const slotFin = addMinutes(cursor, duracionMin);

      const ocupado = turnosExistentes.some((t) =>
        hayConflicto(cursor, slotFin, t.fecha_hora_inicio, t.fecha_hora_fin)
      );

      if (!ocupado) {
        slots.push(format(cursor, 'HH:mm'));
      }

      cursor = addMinutes(cursor, duracionMin);
    }
  }

  return slots;
}

module.exports = { calcularFin, hayConflicto, getSlotsDisponibles };
