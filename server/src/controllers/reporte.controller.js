const reporteService = require('../services/reporte.service');
const { success } = require('../utils/responseHelper');

async function resumen(req, res, next) {
  try {
    const data = await reporteService.resumenMes(req.user.negocio_id);
    success(res, data);
  } catch (err) {
    next(err);
  }
}

async function ingresos(req, res, next) {
  try {
    const data = await reporteService.ingresosPorMes(req.user.negocio_id);
    success(res, data);
  } catch (err) {
    next(err);
  }
}

async function clientesNuevos(req, res, next) {
  try {
    const data = await reporteService.clientesNuevosPorMes(req.user.negocio_id);
    success(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = { resumen, ingresos, clientesNuevos };
