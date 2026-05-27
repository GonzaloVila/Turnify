const { Router } = require('express');
const controller = require('../controllers/turno.controller');
const auth = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/roles.middleware');
const validate = require('../middlewares/validate.middleware');
const { crearTurnoSchema, cambiarEstadoSchema } = require('../validators/turno.validator');
const { ROLES } = require('../utils/constants');

const router = Router();

router.use(auth);

router.get('/disponibilidad', controller.disponibilidad);
router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post(
  '/',
  allowRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PROFESIONAL),
  validate(crearTurnoSchema),
  controller.crear
);
router.put(
  '/:id/estado',
  validate(cambiarEstadoSchema),
  controller.cambiarEstado
);
router.delete('/:id', allowRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), controller.eliminar);

module.exports = router;
