// Dependencies
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const { sequelize, initDb } = require('./db');
const { wrapAsync, wrapAsyncEx, wrapAsyncGen } = require('./utils/wrapAsync');

const { errorHandler, ExpressError } = require('./middleware/errorHandler');
const { SERVER_PORT } = require('./constants/index');

// Import routes
const testDb = require('./routes/testDb');
const authRoutes = require('./routes/auth');
const { createDummyUser } = require('./utils/dbHelpers');

// Express
const app = express();
app.use(express.json());

// Initialise routes
app.use('/', testDb)
app.use('/api/auth', authRoutes);


// Error Catching
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not founddd!', 404));
})
app.use(errorHandler);

app.listen(SERVER_PORT, wrapAsyncGen(async () => {
    await initDb();
    // await createDummyUser();
    console.log(`Serving on port ${SERVER_PORT}`);
}));