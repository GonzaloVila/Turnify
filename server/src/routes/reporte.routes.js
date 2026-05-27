const { Router } = require('express');
const controller = require('../controllers/reporte.controller');
const auth = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/roles.middleware');
const { ROLES } = require('../utils/constants');

const router = Router();

router.use(auth, allowRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN));

router.get('/resumen', controller.resumen);
router.get('/ingresos', controller.ingresos);
router.get('/clientes-nuevos', controller.clientesNuevos);

module.exports = router;
