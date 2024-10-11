const passport = require('passport');
const { validationResult } = require('express-validator');

exports.validationMiddleware = (req, res, next) => {
    const errors = validationResult(req);
    //console.log(errors);
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
            req.user = { user };
        }
        next();
    })(req, res, next);
};


// exports.authenticateJWT = (req, res, next) => {
//     passport.authenticate('jwt', { session: false }, (err, user, info) => {
//         if (err) {
//             return next(err);
//         }
//         if (!user) {
//             //next(new ExpressError('Unathorised', 401));
//             return res.status(401).json({ error: 'Unauthorized' });
//         }
//         req.user = user;
//         next();
//     })(req, res, next);
// };

