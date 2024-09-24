// DB
const { Sequelize } = require('sequelize');
const { DB_NAME, DB_USERNAME, DB_PASSWORD, DB_ADDRESS } = require('../constants');
const { ExpressError } = require('../middleware/errorHandler');

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
    host: DB_ADDRESS,
    dialect: 'postgres', /* one of 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle' */
    logging: false
});

const initDb = async () => {
    const initialSequelize = new Sequelize('postgres', DB_USERNAME, DB_PASSWORD, {
        host: DB_ADDRESS,
        dialect: 'postgres',
        logging: false
    });
    try {
        const [results, metadata] = await initialSequelize.query(
            `SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'`
        );
        if (results.length === 0) {
            // If the database doesn't exist, create it
            await initialSequelize.query(`CREATE DATABASE ${DB_NAME}`);
            console.log(`Database ${DB_NAME} created successfully.`);
        }

    } catch (e) {
        throw new ExpressError(e, 500);
    } finally {
        await initialSequelize.close();
        await sequelize.sync({ alter: true });
        console.log(`Database ${DB_NAME} initiated successfully`);
    }
}

module.exports = { sequelize, initDb };