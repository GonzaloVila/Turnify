const servicioService = require('../services/servicio.service');
const { success } = require('../utils/responseHelper');

async function listar(req, res, next) {
  try {
    const servicios = await servicioService.listar(req.user.negocio_id);
    success(res, servicios);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const servicio = await servicioService.obtener(req.params.id, req.user.negocio_id);
    success(res, servicio);
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const servicio = await servicioService.crear(req.user.negocio_id, req.body);
    success(res, servicio, 201, 'Servicio creado');
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const servicio = await servicioService.actualizar(req.params.id, req.user.negocio_id, req.body);
    success(res, servicio);
  } catch (err) {
    next(err);
  }
}

async function desactivar(req, res, next) {
  try {
    await servicioService.desactivar(req.params.id, req.user.negocio_id);
    success(res, null, 200, 'Servicio desactivado');
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, obtener, crear, actualizar, desactivar };
