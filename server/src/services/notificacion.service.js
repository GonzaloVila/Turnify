// Para activar el envío real de emails, reemplazar los console.log con llamadas a Resend:
// const { Resend } = require('resend');
// const resend = new Resend(process.env.RESEND_API_KEY);
// await resend.emails.send({ from: 'no-reply@turnify.app', to: cliente.email, subject, html });

async function enviarConfirmacionTurno(turno, cliente, negocio) {
  console.log('[Notificacion] Confirmación de turno:', {
    to: cliente.email,
    negocio: negocio.nombre,
    turno_id: turno.id,
    fecha: turno.fecha_hora_inicio,
    servicio: turno.servicio?.nombre,
  });
}

async function enviarRecordatorioTurno(turno, cliente, negocio) {
  console.log('[Notificacion] Recordatorio de turno:', {
    to: cliente.email,
    negocio: negocio.nombre,
    turno_id: turno.id,
    fecha: turno.fecha_hora_inicio,
  });
}

async function enviarCancelacionTurno(turno, cliente, negocio) {
  console.log('[Notificacion] Cancelación de turno:', {
    to: cliente.email,
    negocio: negocio.nombre,
    turno_id: turno.id,
  });
}

module.exports = { enviarConfirmacionTurno, enviarRecordatorioTurno, enviarCancelacionTurno };
