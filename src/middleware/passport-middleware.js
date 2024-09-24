const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { JWT_SECRET } = require('../constants')
const { getUserById } = require('../utils/dbHelpers');
const { ExpressError } = require('./errorHandler');

const cookieExtractor = function (req) {
    let token = null;
    if (req && req.cookies) { token = req.cookies['jwt'] }
    return token;
}

const opts = {
    secretOrKey: JWT_SECRET,
    jwtFromRequest: cookieExtractor
}

passport.use(new JwtStrategy(opts, async ({ id }, done) => {
    try {
        const user = await getUserById(id);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
            //throw new ExpressError('Unauthorized', 401);
        }
    } catch (error) {
        console.log(error.message);
        return done(error, false);
    }
})
);
