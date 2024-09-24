const { check } = require('express-validator');
const { getUser } = require('../utils/dbHelpers');
const { ExpressError } = require('../middleware/errorHandler');

// Pasword
const password = check('password')
    .isLength({ min: 6, max: 15 })
    .withMessage('Password has to be between 6 and 15 characters.');

// Email
const email = check('email').isEmail().withMessage('Please input a valid email.')

// Username
const username = check('username').isLength({ min: 3, max: 15 }).withMessage('Username has to be between 3 and 15 characters.');

//Check if Email or Username exist
const detailsExist = check(['email', 'username']).custom(async (value) => {
    const result = await getUser(value);
    if (result.error) {
        throw new ExpressError('An error occurred while checking user existence', 402);
    }
    if (result.user) {
        throw new ExpressError('Email or username already in use', 401);
    }
})



module.exports = {
    registerValidation: [email, username, password, detailsExist]
}