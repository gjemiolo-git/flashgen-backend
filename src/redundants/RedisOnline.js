const Redis = require('redis');
const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = require('../constants');

// Create Redis client
const redisClient = Redis.createClient({
    password: REDIS_PASSWORD,
    socket: {
        host: REDIS_HOST,
        port: REDIS_PORT
    }
});

redisClient.connect().then(console.log('Redis Connected!')).catch(console.error);
module.exports = redisClient;

// Promisify Redis methods for easier use with async/await
const getAsync = redisClient.get.bind(redisClient);
const setAsync = redisClient.set.bind(redisClient);
const delAsync = redisClient.del.bind(redisClient);

module.exports = {
    getAsync,
    setAsync,
    delAsync,
    redisClient
};
