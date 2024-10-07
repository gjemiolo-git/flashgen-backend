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
        console.error('Error querying user by all:', error);
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


async function getUserByEmail(identifier) {
    try {
        const user = await User.findOne({
            where: {
                email: identifier
            }
        });
        if (user) {
            //console.log('User found:', user.toJSON());
            return { user };
        } else {
            //console.log('No user found with this email.');
            return { user: null };
        }
    } catch (error) {
        console.error('Error querying user by email:', error);
        return { error }
    }
}


async function testAssociationsWithoutSetup() {
    try {
        console.log('Syncing database...');
        await sequelize.sync({ force: true });

        console.log('Creating a book...');
        const book = await Book.create({ title: 'Sample Book' });

        console.log('Creating an author...');
        const author = await Author.create({ name: 'Sample Author' });

        console.log('Attempting to associate book with author...');
        // This might fail if associations aren't set up
        try {
            await book.addAuthor(author);
        } catch (error) {
            console.error('Failed to associate book with author:', error.message);
        }

        console.log('Attempting to fetch book with associated author...');
        try {
            const fetchedBook = await Book.findOne({
                where: { id: book.id },
                include: Author
            });
            console.log('Fetched book:', JSON.stringify(fetchedBook, null, 2));
        } catch (error) {
            console.error('Failed to fetch book with author:', error.message);
        }

        console.log('Checking if BookAuthors table exists...');
        try {
            const [results] = await sequelize.query('SELECT * FROM "BookAuthors"');
            console.log('BookAuthors entries:', results);
        } catch (error) {
            console.error('Failed to query BookAuthors table:', error.message);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

module.exports = { createDummyUser, getUserByEmail, getUser, getUserById }