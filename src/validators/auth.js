const { check } = require('express-validator');
const { getUser } = require('../utils/dbHelpers');
const { ExpressError } = require('../middleware/errorHandler');
const { compare } = require('bcryptjs');

// Pasword
const password = check('password')
    .isLength({ min: 6, max: 15 })
    .withMessage('Password has to be between 6 and 15 characters.');

// Email
const email = check('email').isEmail().withMessage('Please input a valid email.')

// Username
const username = check('username').isLength({ min: 3, max: 15 }).withMessage('Username has to be between 3 and 15 characters.');
const usernameNotEmail = check('username').not().isEmail().withMessage('Username should not be an email address.');

//Check if Email or Username exist
const detailsExist = check(['email', 'username']).custom(async (value) => {
    const result = await getUser(value);
    if (result.error) {
        throw new ExpressError('An error occurred while checking user existence.', 422);
    }
    if (result.user) {
        throw new ExpressError('Email or username already in use.', 401);
    }
});

const loginFields = check('email').custom(async (value, { req }) => {
    const { user } = await getUser(value);
    if (!user) {
        throw new ExpressError('User not found.', 404);
    }
    const validPassword = await compare(req.body.password, user.password_hash)
    if (!validPassword) {
        throw new ExpressError('Provided password is invalid.', 401)
    }

    req.user = user;
})

module.exports = {
    registerValidation: [email, username, usernameNotEmail, password, detailsExist],
    loginValidation: [loginFields]
}