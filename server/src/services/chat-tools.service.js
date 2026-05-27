const servicioService = require('./servicio.service');
const profesionalService = require('./profesional.service');
const disponibilidadService = require('./disponibilidad.service');
const turnoService = require('./turno.service');

// Formato OpenAI-compatible (usado por Groq)
const tools = [
  {
    type: 'function',
    function: {
      name: 'list_services',
      description: 'Lista todos los servicios disponibles del negocio con nombre, precio y duración en minutos.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_professionals',
      description: 'Lista los profesionales activos del negocio con nombre y especialidad.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_availability',
      description: 'Consulta los horarios disponibles (slots) para un profesional, servicio y fecha específica. Devuelve lista de horarios en formato HH:mm.',
      parameters: {
        type: 'object',
        properties: {
          service_id: { type: 'string', description: 'ID del servicio.' },
          professional_id: { type: 'string', description: 'ID del profesional.' },
          date: { type: 'string', description: 'Fecha en formato YYYY-MM-DD.' },
        },
        required: ['service_id', 'professional_id', 'date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'book_appointment',
      description: 'Reserva un turno. Llamar SOLO después de confirmar explícitamente con el cliente: servicio, profesional, fecha, hora, nombre y teléfono.',
      parameters: {
        type: 'object',
        properties: {
          service_id: { type: 'string', description: 'ID del servicio.' },
          professional_id: { type: 'string', description: 'ID del profesional.' },
          date_time: { type: 'string', description: 'Fecha y hora en ISO 8601, ej: 2024-03-15T10:00:00.' },
          client_name: { type: 'string', description: 'Nombre completo del cliente.' },
          client_phone: { type: 'string', description: 'Teléfono del cliente.' },
          client_email: { type: 'string', description: 'Email del cliente (opcional).' },
        },
        required: ['service_id', 'professional_id', 'date_time', 'client_name', 'client_phone'],
      },
    },
  },
];

async function dispatchTool(name, args, negocioId) {
  switch (name) {
    case 'list_services':
      return servicioService.listar(negocioId);

    case 'list_professionals':
      return profesionalService.listar(negocioId);

    case 'check_availability':
      return disponibilidadService.obtenerSlots(
        args.professional_id,
        args.service_id,
        args.date
      );

    case 'book_appointment': {
      const turno = await turnoService.crear(
        negocioId,
        {
          profesional_id: args.professional_id,
          servicio_id: args.service_id,
          fecha_hora_inicio: args.date_time,
          cliente: {
            nombre: args.client_name,
            telefono: args.client_phone,
            email: args.client_email || null,
          },
        },
        'WEB'
      );
      return {
        servicio: turno.servicio?.nombre,
        profesional: turno.profesional?.nombre,
        fecha_hora_inicio: turno.fecha_hora_inicio,
        estado: turno.estado,
        cliente: turno.cliente?.nombre,
      };
    }

    default:
      throw new Error(`Tool desconocida: ${name}`);
  }
}

// Gemini native format
const geminiTools = [{
  functionDeclarations: [
    {
      name: 'list_services',
      description: 'Lista todos los servicios disponibles del negocio con nombre, precio y duración en minutos.',
      parameters: { type: 'OBJECT', properties: {} },
    },
    {
      name: 'list_professionals',
      description: 'Lista los profesionales activos del negocio con nombre y especialidad.',
      parameters: { type: 'OBJECT', properties: {} },
    },
    {
      name: 'check_availability',
      description: 'Consulta los horarios disponibles (slots) para un profesional, servicio y fecha específica. Devuelve lista de horarios en formato HH:mm.',
      parameters: {
        type: 'OBJECT',
        properties: {
          service_id: { type: 'STRING', description: 'ID del servicio.' },
          professional_id: { type: 'STRING', description: 'ID del profesional.' },
          date: { type: 'STRING', description: 'Fecha en formato YYYY-MM-DD.' },
        },
        required: ['service_id', 'professional_id', 'date'],
      },
    },
    {
      name: 'book_appointment',
      description: 'Reserva un turno. Llamar SOLO después de confirmar explícitamente con el cliente: servicio, profesional, fecha, hora, nombre y teléfono.',
      parameters: {
        type: 'OBJECT',
        properties: {
          service_id: { type: 'STRING', description: 'ID del servicio.' },
          professional_id: { type: 'STRING', description: 'ID del profesional.' },
          date_time: { type: 'STRING', description: 'Fecha y hora en ISO 8601, ej: 2024-03-15T10:00:00.' },
          client_name: { type: 'STRING', description: 'Nombre completo del cliente.' },
          client_phone: { type: 'STRING', description: 'Teléfono del cliente.' },
          client_email: { type: 'STRING', description: 'Email del cliente (opcional).' },
        },
        required: ['service_id', 'professional_id', 'date_time', 'client_name', 'client_phone'],
      },
    },
  ],
}];

module.exports = { tools, geminiTools, dispatchTool };
