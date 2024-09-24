// Dependencies
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const { sequelize, initDb } = require('./db/initDb');
const { wrapAsync, wrapAsyncEx } = require('./utils/wrapAsync');

const { errorHandler, ExpressError } = require('./middleware/errorHandler');
const { SERVER_PORT } = require('./constants/index');

// Import routes
const testDb = require('./routes/testDb');
const authRoutes = require('./routes/auth');


// Express
const app = express();
app.use(express.urlencoded({ extended: true }));

// Initialise routes
app.use('/', testDb)
app.use('/auth', authRoutes);


// Error Catching
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not founddd!', 404));
})
app.use(errorHandler);

app.listen(SERVER_PORT, wrapAsyncEx(async () => {
    await initDb();
    console.log(`Serving on port ${SERVER_PORT}`);
}));