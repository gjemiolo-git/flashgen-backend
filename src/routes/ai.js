const { Router } = require('express');
const router = Router({ mergeParams: true });
const { wrapAsync, wrapAsyncGen } = require('../utils/wrapAsync');
const { aiFetch } = require('../controllers/ai');
const { registerValidation, loginValidation } = require('../validators/auth');
const { validationMiddleware, authenticateJWT } = require('../middleware/auth');


router.post('/get-cards', aiFetch);

module.exports = router;