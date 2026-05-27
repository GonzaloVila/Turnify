const { Router } = require('express');
const controller = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { loginSchema, registerSchema } = require('../validators/auth.validator');

const router = Router();

router.post('/login', validate(loginSchema), controller.login);
router.post('/register', validate(registerSchema), controller.register);
router.get('/me', authMiddleware, controller.me);

module.exports = router;
