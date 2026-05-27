const negocioService = require('../services/negocio.service');
const { success } = require('../utils/responseHelper');

async function listar(req, res, next) {
  try {
    const negocios = await negocioService.listar();
    success(res, negocios);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const negocio = await negocioService.obtener(req.params.id);
    success(res, negocio);
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const negocio = await negocioService.actualizar(req.params.id, req.body);
    success(res, negocio);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await negocioService.eliminar(req.params.id);
    success(res, null, 200, 'Negocio eliminado');
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, obtener, actualizar, eliminar };
