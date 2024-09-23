// Dependencies
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const { initDB, sequelize } = require('./utils/dbInit.js');
const User = require('./models/User.js')(sequelize);
const { errorHandler, ExpressError } = require('./middleware/errorHandler');

async function createDummyUser() {
    try {
        // Sync the model with the database
        await sequelize.query(`DELETE FROM "Users" WHERE 1=1;`);
        //await sequelize.query(`DROP TABLE "Users";`);
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


// Express
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);

app.get('/', async (req, res) => {
    await initDB();
    //await createDummyUser();
    await getUserByEmail('dummy@example.com')
        .catch(error => {
            console.error('Error:', error);
        });
    // Close the database connection
    await sequelize.close().catch(e => console.log(`Error closing connection:`, e));
    res.send('Hello world!');


})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not founddd!', 404));
})
app.use(errorHandler);

app.listen(3000, () => {
    console.log('Serving on port 3000');
})