const { error } = require('../utils/responseHelper');

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return error(res, 'No tienes permisos para realizar esta acción', 403);
    }
    next();
  };
}

module.exports = { allowRoles };
