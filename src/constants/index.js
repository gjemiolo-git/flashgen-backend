const { config } = require('dotenv');
config()

module.exports = {
    PROJECT_NAME: process.env.PROJECT_NAME || 'project',
    //SERVER
    SERVER_PORT: process.env.SERVER_PORT,
    CLIENT_URL: process.env.CLIENT_URL,
    SERVER_URL: process.env.SERVER_URL,

    //DB
    DB_ADDRESS: process.env.DB_ADDRESS || 'localhost',
    DB_NAME: process.env.DB_NAME || 'flashgen',
    DB_USERNAME: process.env.DB_SUPERUSER || 'postgre',
    DB_PASSWORD: process.env.DB_PASSWORD || '',

    //JWT
    JWT_SECRET: process.env.JWT_SECRET || 'jwt_secrett',
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || 'pw',
    REDIS_PORT: process.env.REDIS_PORT || 6379,
    SESSION_SECRET: process.env.SESSION_SECRET || 'session_secrett'
}