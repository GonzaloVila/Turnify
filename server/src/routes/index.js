const { Router } = require('express');
const prisma = require('../config/db');
const turnoService = require('../services/turno.service');
const disponibilidadService = require('../services/disponibilidad.service');
const { buscarOCrear } = require('../services/cliente.service');
const notificacion = require('../services/notificacion.service');
const { success, error } = require('../utils/responseHelper');

const router = Router();

router.use('/auth', require('./auth.routes'));
router.use('/negocios', require('./negocio.routes'));
router.use('/profesionales', require('./profesional.routes'));
router.use('/servicios', require('./servicio.routes'));
router.use('/horarios', require('./horario.routes'));
router.use('/turnos', require('./turno.routes'));
router.use('/clientes', require('./cliente.routes'));
router.use('/reportes', require('./reporte.routes'));

// Reserva pública (sin auth)
router.get('/publico/:slug', async (req, res, next) => {
  try {
    const negocio = await prisma.negocio.findUnique({
      where: { slug: req.params.slug },
      select: { id: true, nombre: true, descripcion: true, logo_url: true, direccion: true, telefono: true },
    });
    if (!negocio) return error(res, 'Negocio no encontrado', 404);
    success(res, negocio);
  } catch (err) {
    next(err);
  }
});

router.get('/publico/:slug/servicios', async (req, res, next) => {
  try {
    const negocio = await prisma.negocio.findUnique({ where: { slug: req.params.slug } });
    if (!negocio) return error(res, 'Negocio no encontrado', 404);
    const servicios = await prisma.servicio.findMany({
      where: { negocio_id: negocio.id, activo: true },
      orderBy: { nombre: 'asc' },
    });
    success(res, servicios);
  } catch (err) {
    next(err);
  }
});

router.get('/publico/:slug/profesionales', async (req, res, next) => {
  try {
    const negocio = await prisma.negocio.findUnique({ where: { slug: req.params.slug } });
    if (!negocio) return error(res, 'Negocio no encontrado', 404);
    const profesionales = await prisma.profesional.findMany({
      where: { negocio_id: negocio.id, activo: true },
      select: { id: true, nombre: true, especialidad: true, avatar_url: true },
      orderBy: { nombre: 'asc' },
    });
    success(res, profesionales);
  } catch (err) {
    next(err);
  }
});

router.get('/publico/:slug/disponibilidad', async (req, res, next) => {
  try {
    const { profesional_id, servicio_id, fecha } = req.query;
    const result = await disponibilidadService.obtenerSlots(profesional_id, servicio_id, fecha);
    success(res, result);
  } catch (err) {
    next(err);
  }
});

router.use('/publico/:slug/chat', require('./chat.routes'));

router.post('/publico/:slug/reservar', async (req, res, next) => {
  try {
    const negocio = await prisma.negocio.findUnique({ where: { slug: req.params.slug } });
    if (!negocio) return error(res, 'Negocio no encontrado', 404);

    const { profesional_id, servicio_id, fecha_hora_inicio, cliente: clienteData } = req.body;

    const cliente = await buscarOCrear(negocio.id, clienteData);

    const turno = await turnoService.crear(
      negocio.id,
      { profesional_id, servicio_id, cliente_id: cliente.id, fecha_hora_inicio },
      'WEB'
    );

    await notificacion.enviarConfirmacionTurno(turno, cliente, negocio);

    success(res, turno, 201, 'Turno reservado correctamente');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
