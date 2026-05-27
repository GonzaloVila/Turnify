const clienteService = require('../services/cliente.service');
const { success } = require('../utils/responseHelper');

async function listar(req, res, next) {
  try {
    const clientes = await clienteService.listar(req.user.negocio_id, req.query.search);
    success(res, clientes);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const cliente = await clienteService.obtener(req.params.id, req.user.negocio_id);
    success(res, cliente);
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const cliente = await clienteService.crear(req.user.negocio_id, req.body);
    success(res, cliente, 201, 'Cliente creado');
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const cliente = await clienteService.actualizar(req.params.id, req.user.negocio_id, req.body);
    success(res, cliente);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await clienteService.eliminar(req.params.id, req.user.negocio_id);
    success(res, null, 200, 'Cliente eliminado');
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
