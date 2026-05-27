const { IS_DEV } = require('../config/env');

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      data: null,
      message: `Ya existe un registro con ese valor único (${err.meta?.target?.join(', ')})`,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'Registro no encontrado',
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
    ...(IS_DEV && { stack: err.stack }),
  });
}

module.exports = errorHandler;
