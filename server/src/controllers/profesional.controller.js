const profesionalService = require('../services/profesional.service');
const { success } = require('../utils/responseHelper');

async function listar(req, res, next) {
  try {
    const profesionales = await profesionalService.listar(req.user.negocio_id);
    success(res, profesionales);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const profesional = await profesionalService.obtener(req.params.id, req.user.negocio_id);
    success(res, profesional);
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const profesional = await profesionalService.crear(req.user.negocio_id, req.body);
    success(res, profesional, 201, 'Profesional creado');
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const profesional = await profesionalService.actualizar(req.params.id, req.user.negocio_id, req.body);
    success(res, profesional);
  } catch (err) {
    next(err);
  }
}

async function desactivar(req, res, next) {
  try {
    await profesionalService.desactivar(req.params.id, req.user.negocio_id);
    success(res, null, 200, 'Profesional desactivado');
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, obtener, crear, actualizar, desactivar };
