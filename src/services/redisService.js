const { createClient } = require('redis');
const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, PROJECT_NAME } = require('../constants');

// Create Redis client
const redisClient = createClient({
    socket: {
        host: REDIS_HOST,
        port: REDIS_PORT
    },
    password: REDIS_PASSWORD,
    enable_offline_queue: false
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
// redisClient.on('connect', () => console.log('Redis Client Connected'));
redisClient.on('ready', () => console.log('Redis Client Ready on', REDIS_HOST));

module.exports = redisClient;


// Promisify Redis methods for easier use with async/await
const getAsync = redisClient.get.bind(redisClient);
const setAsync = redisClient.set.bind(redisClient);
const delAsync = redisClient.del.bind(redisClient);

module.exports = { redisClient, getAsync, setAsync, delAsync };


