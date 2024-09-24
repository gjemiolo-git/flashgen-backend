const { Router } = require('express');
const router = Router({ mergeParams: true });
const { wrapAsync, wrapAsyncGen } = require('../utils/wrapAsync');
const { getUsers, register, login, protected, logout } = require('../controllers/auth');
const { registerValidation, loginValidation } = require('../validators/auth');
const { validationMiddleware, authenticateJWT } = require('../middleware/auth');

router.get('/get-users', wrapAsync(getUsers));
router.get('/protected', authenticateJWT, protected);
router.post('/logout', authenticateJWT, logout);
router.post('/register', registerValidation, validationMiddleware, wrapAsync(register));
router.post('/login', loginValidation, validationMiddleware, wrapAsync(login));

module.exports = router;