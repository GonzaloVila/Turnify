const { verifyToken } = require('../utils/jwt');
const { error } = require('../utils/responseHelper');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Token no proporcionado', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    return error(res, 'Token inválido o expirado', 401);
  }
}

module.exports = authMiddleware;
