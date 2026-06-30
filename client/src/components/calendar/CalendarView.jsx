import { useMemo, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import CalendarEvent from './CalendarEvent';

moment.locale('es');
const localizer = momentLocalizer(moment);

const PROF_COLORS = ['#4f6bed', '#0d9668', '#d97706', '#7c3aed', '#db2777', '#0891b2'];

export default function CalendarView({ turnos, onSelectEvent, onSelectSlot }) {
  const [view, setView] = useState('week');

  const profList = useMemo(() => {
    const seen = new Map();
    (turnos || []).forEach((t) => {
      if (t.profesional?.id && !seen.has(t.profesional.id)) {
        seen.set(t.profesional.id, t.profesional.nombre);
      }
    });
    return [...seen.entries()].map(([id, nombre], i) => ({
      id,
      nombre,
      color: PROF_COLORS[i % PROF_COLORS.length],
    }));
  }, [turnos]);

  const profColorMap = useMemo(() => {
    const map = {};
    profList.forEach((p) => { map[p.id] = p.color; });
    return map;
  }, [profList]);

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

  const eventStyleGetter = (event) => {
    const color = profColorMap[event.resource?.profesional?.id] || '#3b82f6';
    return {
      style: {
        backgroundColor: color,
        borderRadius: '4px',
        border: `1px solid ${color}`,
        borderLeft: `3px solid ${color}`,
        fontSize: '11px',
        color: 'white',
      },
    };
  };

  const minTime = new Date();
  minTime.setHours(8, 0, 0, 0);
  const maxTime = new Date();
  maxTime.setHours(21, 0, 0, 0);

  return (
    <div>
      {profList.length > 0 && (
        <div className="calendar-legend">
          {profList.map((p) => (
            <span key={p.id} className="calendar-legend-item">
              <span className="calendar-legend-dot" style={{ background: p.color }} />
              {p.nombre}
            </span>
          ))}
        </div>
      )}
      <Calendar
        localizer={localizer}
        events={events}
        view={view}
        onView={setView}
        views={['month', 'week', 'day']}
        defaultView="week"
        startAccessor="start"
        endAccessor="end"
        min={minTime}
        max={maxTime}
        dayLayoutAlgorithm="no-overlap"
        style={{ height: '75vh' }}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        selectable
        eventPropGetter={eventStyleGetter}
        components={{ event: CalendarEvent }}
        formats={{
          eventTimeRangeFormat: () => '',
        }}
        messages={{
          next: 'Sig',
          previous: 'Ant',
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Dia',
        }}
      />
    </div>
  );
}
