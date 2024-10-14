// DB
const { Sequelize } = require('sequelize');
const { DB_URL, DB_NAME, DB_USERNAME, DB_PASSWORD, DB_ADDRESS } = require('../constants');
const { ExpressError } = require('../middleware/errorHandler');

let sequelize;

if (DB_URL) {
    sequelize = new Sequelize(DB_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    });
} else {
    sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
        host: DB_ADDRESS,
        dialect: 'postgres',
        logging: false
    });
}

const resolveAssociations = async () => {
    Object.values(sequelize.models).forEach(model => {
        if (model.associate) {
            model.associate(sequelize.models);
        }
    });
}

const initDb = async () => {
    let initialSequelize;

    if (DB_URL) {
        initialSequelize = new Sequelize(DB_URL, {
            dialect: 'postgres',
            logging: false,
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            }
        });
    } else {
        initialSequelize = new Sequelize('postgres', DB_USERNAME, DB_PASSWORD, {
            host: DB_ADDRESS,
            dialect: 'postgres',
            logging: false
        });
    }

    try {
        if (!DB_URL) {
            const [results, metadata] = await initialSequelize.query(
                `SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'`
            );
            if (results.length === 0) {
                await initialSequelize.query(`CREATE DATABASE ${DB_NAME}`);
                console.log(`Database ${DB_NAME} created successfully.`);
            }
        }
    } catch (e) {
        throw new ExpressError(e, 500);
    } finally {
        await initialSequelize.close();
        await resolveAssociations();
        await sequelize.sync({ alter: true });
        console.log(`Database ${DB_URL ? 'connection established' : DB_NAME + ' initiated'} successfully`);
    }
}

module.exports = { sequelize, initDb };
