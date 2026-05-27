const horarioService = require('../services/horario.service');
const { success } = require('../utils/responseHelper');

async function listarPorProfesional(req, res, next) {
  try {
    const horarios = await horarioService.listarPorProfesional(req.params.profesional_id);
    success(res, horarios);
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const horario = await horarioService.crear(req.body);
    success(res, horario, 201, 'Horario creado');
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const horario = await horarioService.actualizar(req.params.id, req.body);
    success(res, horario);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await horarioService.eliminar(req.params.id);
    success(res, null, 200, 'Horario eliminado');
  } catch (err) {
    next(err);
  }
}

module.exports = { listarPorProfesional, crear, actualizar, eliminar };
