// Dependencies
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const app = express();
const passport = require('passport');
const cors = require('cors');
require('./middleware/passport-middleware');

const { initDb } = require('./db');
const { wrapAsyncGen } = require('./utils/wrapAsync');
const { errorHandler } = require('./middleware/errorHandler');
const { SERVER_PORT, CLIENT_URL } = require('./constants/index');
const cookieParser = require('cookie-parser');

// Import routes
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');

// Testers
const { createDummyUser } = require('./utils/dbHelpers');

// Express
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(cors({
    origin: [`http://${CLIENT_URL}`, `https://${CLIENT_URL}`, `https://www.${CLIENT_URL}`],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Initialise routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

app.use(errorHandler);

app.listen(SERVER_PORT, wrapAsyncGen(async () => {
    await initDb();
    console.log(`Server on port ${SERVER_PORT}`);
}));