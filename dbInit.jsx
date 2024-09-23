// DB
const { Sequelize } = require('sequelize');
const dbAddress = process.env.DB_ADDRESS || 'localhost';
const dbName = process.env.DB_NAME || 'flashgen';
const dbUsername = process.env.DB_SUPERUSER || '';
const dbPw = process.env.DB_PASSWORD || '';
const sequelize = new Sequelize(dbName, dbUsername, dbPw, {
    host: dbAddress,
    dialect: 'postgres', /* one of 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle' */
    logging: false
});

const initDB = async () => {
    // Test the connection and create the database if it doesn't exist
    // Check if the target database exists
    const initialSequelize = new Sequelize('postgres', dbUsername, dbPw, {
        host: dbAddress,
        dialect: 'postgres',
        logging: false
    });
    const [results, metadata] = await initialSequelize.query(
        `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`
    );
    if (results.length === 0) {
        // If the database doesn't exist, create it
        await initialSequelize.query(`CREATE DATABASE ${dbName}`);
        console.log(`Database ${dbName} created successfully.`);
    } else {
        console.log(`Database ${dbName} already exists.`);
    }

    // Close the initial connection
    await initialSequelize.close();
}

module.exports = { initDB, sequelize };