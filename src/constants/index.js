const { config } = require('dotenv');
config()

module.exports = {
    //DB
    DB_ADDRESS: process.env.DB_ADDRESS || 'localhost',
    DB_NAME: process.env.DB_NAME || 'flashgen',
    DB_USERNAME: process.env.DB_SUPERUSER || '',
    DB_PASSWORD: process.env.DB_PASSWORD || '',

    //SERVER
    SERVER_PORT: process.env.SERVER_PORT,
    CLIENT_URL: process.env.CLIENT_URL,
    SERVER_URL: process.env.SERVER_URL,

}