export default function CalendarEvent({ event }) {
  return (
    <div className="calendar-event" title={`${event.title} — ${event.resource?.cliente?.nombre}`}>
      <span className="event-title">{event.title}</span>
      <span className="event-cliente">{event.resource?.cliente?.nombre}</span>
    </div>
  );
}
