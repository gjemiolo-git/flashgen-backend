const { Router } = require('express');
const router = Router({ mergeParams: true });
const { wrapAsync } = require('../utils/wrapAsync');
const { getUsers, register, login } = require('../controllers/auth');
const { registerValidation, loginValidation } = require('../validators/auth');
const { validationMiddleware } = require('../middleware/auth');

router.get('/get-users', wrapAsync(getUsers));
router.post('/register', registerValidation, validationMiddleware, wrapAsync(register));
router.post('/login', loginValidation, validationMiddleware, wrapAsync(login));

module.exports = router;