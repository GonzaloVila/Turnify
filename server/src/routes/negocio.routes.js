const { Router } = require('express');
const controller = require('../controllers/negocio.controller');
const auth = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/roles.middleware');
const validate = require('../middlewares/validate.middleware');
const { actualizarNegocioSchema } = require('../validators/negocio.validator');
const { ROLES } = require('../utils/constants');

const router = Router();

router.use(auth);

router.get('/', allowRoles(ROLES.SUPER_ADMIN), controller.listar);
router.get('/:id', controller.obtener);
router.put('/:id', validate(actualizarNegocioSchema), controller.actualizar);
router.delete('/:id', allowRoles(ROLES.SUPER_ADMIN), controller.eliminar);

module.exports = router;
