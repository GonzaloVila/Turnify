const authService = require('../services/auth.service');
const { success } = require('../utils/responseHelper');

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    success(res, result, 200, 'Login exitoso');
  } catch (err) {
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    success(res, result, 201, 'Negocio y usuario creados correctamente');
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const usuario = await authService.me(req.user.id);
    success(res, usuario);
  } catch (err) {
    next(err);
  }
}

module.exports = { login, register, me };
