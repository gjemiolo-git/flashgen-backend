const { Router } = require('express');
const router = Router({ mergeParams: true });
const { wrapAsync } = require('../utils/wrapAsync');
const { getUsers, register } = require('../controllers/auth');
const { registerValidation } = require('../validators/auth');
const { validationMiddleware } = require('../middleware/auth');

router.get('/', wrapAsync(getUsers));

router.post('/register', registerValidation, validationMiddleware, wrapAsync(register));

module.exports = router;