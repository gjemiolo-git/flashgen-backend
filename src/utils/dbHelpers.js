const { Op } = require('sequelize');
const { sequelize } = require('../db/index.js');
const User = require('../db/models/User.js')(sequelize);

async function createDummyUser() {
    try {
        // Sync the model with the database
        await sequelize.query(`DELETE FROM "Users" WHERE 1=1;`);
        await sequelize.query(`DROP TABLE "Users";`);
        await sequelize.sync();

        const hashedPassword = 'password123-hashed'

        // Create a dummy user
        const dummyUser = await User.create({
            email: 'dummy@example.com',
            username: 'dummyUser',
            password_hash: hashedPassword,
            role: 'user'
        });

        console.log('Dummy user created:', dummyUser.toJSON());
    } catch (error) {
        console.error('Error creating dummy user:', error);
    }
}

async function getUser(identifier) {
    try {
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { email: identifier },
                    { id: isNaN(identifier) ? null : identifier },
                    { username: identifier }
                ]
            }
        });

        if (user) {
            return { user };
        } else {
            return { user: null };
        }
    } catch (error) {
        console.error('Error querying user:', error);
        return { error };
    }
}

async function getUserById(id) {
    try {
        const user = await User.findByPk(id);

        if (user) {
            return { user };
        } else {
            return { user: null };
        }
    } catch (error) {
        console.error('Error querying user by ID:', error);
        return { error };
    }
}


async function getUserByEmail(email) {
    try {
        const user = await User.findOne({
            where: {
                email: email
            }
        });

        if (user) {
            console.log('User found:', user.toJSON());
            return user;
        } else {
            console.log('No user found with this email.');
            return null;
        }
    } catch (error) {
        console.error('Error querying user:', error);
        throw error;
    }
}

module.exports = { createDummyUser, getUserByEmail, getUser, getUserById }