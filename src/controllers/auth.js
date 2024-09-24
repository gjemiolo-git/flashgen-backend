const { sequelize } = require('../db/');
const { wrapAsync } = require('../utils/wrapAsync');
const { hash } = require('bcryptjs');
const { sign } = require('jsonwebtoken');
const User = require('../db/models/User')(sequelize);
const { JWT_SECRET } = require('../constants');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'password_hash']
        })
        return res.status(200).json({
            success: true,
            users
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}

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
        email: user.email
    }
    try {
        const token = await sign(payload, JWT_SECRET);
        return res.status(200)
            .cookie('token', token)
            .json({
                success: true,
                user: { ...payload }
            })

    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}