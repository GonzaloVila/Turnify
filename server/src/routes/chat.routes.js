const { Router } = require('express');
const { chat } = require('../controllers/chat.controller');
const validate = require('../middlewares/validate.middleware');
const { chatSchema } = require('../validators/chat.validator');

const router = Router({ mergeParams: true });

router.post('/', validate(chatSchema), chat);

module.exports = router;
