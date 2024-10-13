const passport = require('passport');
const { validationResult } = require('express-validator');

exports.validationMiddleware = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(409).json({
            errors: errors.array()
        })
    }
    next();
}

exports.authenticateJWT = passport.authenticate('jwt', { session: false });

exports.publicAuthenticateJWT = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (user) {
            req.user = user;
        }
        next();
    })(req, res, next);
};

