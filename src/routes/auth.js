const { Router } = require('express');
const router = Router({ mergeParams: true });
const { wrapAsync, wrapAsyncGen } = require('../utils/wrapAsync');
const { register, login, logout } = require('../controllers/auth');
const { registerValidation, loginValidation } = require('../validators/auth');
const { validationMiddleware, authenticateJWT } = require('../middleware/auth');

router.post('/logout', logout);
router.post('/register', registerValidation, validationMiddleware, wrapAsync(register));
router.post('/login', loginValidation, validationMiddleware, wrapAsync(login));

module.exports = router;