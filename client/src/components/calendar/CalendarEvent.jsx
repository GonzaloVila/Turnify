export default function CalendarEvent({ event }) {
  const profFirst = event.resource?.profesional?.nombre?.split(' ')[0] || '';

  return (
    <div className="calendar-event">
      <span className="event-client">{event.resource?.cliente?.nombre}</span>
      <span className="event-meta">{event.title} · {profFirst}</span>
    </div>
  );
}
