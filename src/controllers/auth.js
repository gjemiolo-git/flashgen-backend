const { sequelize } = require('../db/');
const { wrapAsync } = require('../utils/wrapAsync');
const { hash } = require('bcryptjs');
const { sign } = require('jsonwebtoken');
const User = require('../db/models/User')(sequelize);
const { JWT_SECRET, COOKIE_DOMAIN } = require('../constants');

exports.logout = (req, res) => {
    res.status(200)
        .clearCookie('jwt', { httpOnly: true, sameSite: 'Lax' })
        .json({ success: true, message: 'Logged out successfully' });
};

exports.register = async (req, res) => {
    try {
        const saltRounds = 10;
        const { username, email, password } = req.body;
        const password_hash = await hash(password, saltRounds);
        const user = await User.create({ username, email, password_hash });
        return res.status(201).json({
            success: true,
            message: 'The registration was successful.'
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: error.message
        })
    }
};

exports.login = async (req, res) => {
    const user = req.user;
    const payload = {
        id: user.id,
        username: user.username,
        email: user.email
    }
    try {
        const token = sign(payload, JWT_SECRET, { expiresIn: '1h' });
        const isProduction = process.env.NODE_ENV === 'production';

        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'None' : 'Lax',
            maxAge: 60 * 60 * 1000
        };

        return res.status(200)
            .cookie('jwt', token, cookieOptions)
            .json({
                user: {
                    username: user.username,
                    email: user.email
                },
                success: true,
                message: 'Logged in successfully'
            })
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}


