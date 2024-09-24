// Dependencies
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const app = express();
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
require('./middleware/passport-middleware');
// const RedisStore = require('connect-redis').default;
// const { redisClient, getAsync, setAsync } = require('./services/redisService');

const { sequelize, initDb } = require('./db');
const { wrapAsync, wrapAsyncGen } = require('./utils/wrapAsync');
const { errorHandler, ExpressError } = require('./middleware/errorHandler');
const { SERVER_PORT, SESSION_SECRET, CLIENT_URL } = require('./constants/index');
const cookieParser = require('cookie-parser');

// Import routes
const testDb = require('./routes/testDb');
const authRoutes = require('./routes/auth');

// Testers
const { createDummyUser } = require('./utils/dbHelpers');
//const { checkRedisConnection } = require('./utils/testers');

// Express

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
// Redis
// const redisStore = new RedisStore({
//     client: redisClient,
//     prefix: "flasgen:",
// })

// app.use(session({
//     store: redisStore,
//     secret: SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         secure: process.env.NODE_ENV === 'production',
//         httpOnly: true,
//         maxAge: 1000 * 60 * 60 * 24 // 1 day*
//     }
// }));

// Initialise routes
app.use('/', testDb)
app.use('/api/auth', authRoutes);

// Error Catching
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not founddd!', 404));
})

app.use(errorHandler);


app.listen(SERVER_PORT, wrapAsyncGen(async () => {
    // await createDummyUser();
    //await checkRedisConnection();
    //await redisClient.connect().catch(console.error);
    await initDb();
    console.log(`Server on port ${SERVER_PORT}`);
}));