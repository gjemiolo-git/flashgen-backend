const { redisClient, getAsync, setAsync } = require('../services/redisService');

async function checkRedisConnection() {
    try {
        // Set a test value
        await setAsync('test_key', 'Hello Redis');

        // Retrieve the test value
        const result = await getAsync('test_key');

        if (result === 'Hello Redis') {
            console.log('Redis is working correctly!');
            console.log(result);
            return true;
        } else {
            console.log('Redis test failed: unexpected value');
            return false;
        }
    } catch (error) {
        console.error('Redis connection test failed:', error);
        return false;
    }
}

module.exports = { checkRedisConnection };