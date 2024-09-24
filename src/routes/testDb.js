const { Router } = require('express');
const router = Router({ mergeParams: true });
const { sequelize } = require('../db/initDb');
const { getUserByEmail } = require('../utils/testingDb');

router.get('/', async (req, res) => {
    // await initDb();
    //await createDummyUser();
    await getUserByEmail('dummy@example.com')
        .catch(error => {
            console.error('Error:', error);
        });
    // Close tehe database connection
    await sequelize.close().catch(e => console.log(`Error closing connection:`, e));
    res.send('Hello world!');
})

module.exports = router;