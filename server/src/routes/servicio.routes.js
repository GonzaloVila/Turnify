const { Router } = require('express');
const controller = require('../controllers/servicio.controller');
const auth = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/roles.middleware');
const { ROLES } = require('../utils/constants');

const router = Router();

router.use(auth);

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', allowRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), controller.crear);
router.put('/:id', allowRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), controller.actualizar);
router.delete('/:id', allowRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), controller.desactivar);

module.exports = router;
