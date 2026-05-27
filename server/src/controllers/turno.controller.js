const turnoService = require('../services/turno.service');
const disponibilidadService = require('../services/disponibilidad.service');
const { success } = require('../utils/responseHelper');

async function listar(req, res, next) {
  try {
    const { fecha, profesional_id, estado } = req.query;
    const turnos = await turnoService.listar(req.user.negocio_id, { fecha, profesional_id, estado });
    success(res, turnos);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const turno = await turnoService.obtener(req.params.id, req.user.negocio_id);
    success(res, turno);
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const turno = await turnoService.crear(req.user.negocio_id, req.body);
    success(res, turno, 201, 'Turno creado');
  } catch (err) {
    next(err);
  }
}

async function cambiarEstado(req, res, next) {
  try {
    const turno = await turnoService.cambiarEstado(req.params.id, req.user.negocio_id, req.body.estado);
    success(res, turno);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await turnoService.eliminar(req.params.id, req.user.negocio_id);
    success(res, null, 200, 'Turno eliminado');
  } catch (err) {
    next(err);
  }
}

async function disponibilidad(req, res, next) {
  try {
    const { profesional_id, servicio_id, fecha } = req.query;
    const result = await disponibilidadService.obtenerSlots(profesional_id, servicio_id, fecha);
    success(res, result);
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, obtener, crear, cambiarEstado, eliminar, disponibilidad };
