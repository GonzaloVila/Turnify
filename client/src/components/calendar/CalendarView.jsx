import { useMemo, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import CalendarEvent from './CalendarEvent';

moment.locale('es');
const localizer = momentLocalizer(moment);

const ESTADO_COLOR = {
  PENDIENTE: '#f59e0b',
  CONFIRMADO: '#3b82f6',
  CANCELADO: '#ef4444',
  COMPLETADO: '#10b981',
  AUSENTE: '#6b7280',
};

export default function CalendarView({ turnos, onSelectEvent, onSelectSlot }) {
  const [view, setView] = useState('week');

  const events = useMemo(
    () =>
      (turnos || []).map((t) => ({
        id: t.id,
        title: t.servicio?.nombre || 'Turno',
        start: new Date(t.fecha_hora_inicio),
        end: new Date(t.fecha_hora_fin),
        resource: t,
      })),
    [turnos]
  );

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: event.resource?.servicio?.color || ESTADO_COLOR[event.resource?.estado] || '#3b82f6',
      borderRadius: '4px',
      border: 'none',
      fontSize: '12px',
    },
  });

  return (
    <Calendar
      localizer={localizer}
      events={events}
      view={view}
      onView={setView}
      views={['month', 'week', 'day']}
      defaultView="week"
      startAccessor="start"
      endAccessor="end"
      style={{ height: '70vh' }}
      onSelectEvent={onSelectEvent}
      onSelectSlot={onSelectSlot}
      selectable
      eventPropGetter={eventStyleGetter}
      components={{ event: CalendarEvent }}
      messages={{
        next: 'Siguiente',
        previous: 'Anterior',
        today: 'Hoy',
        month: 'Mes',
        week: 'Semana',
        day: 'Día',
      }}
    />
  );
}
