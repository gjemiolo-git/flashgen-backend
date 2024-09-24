const { Router } = require('express');
const router = Router({ mergeParams: true });
const { sequelize } = require('../db');
const { getUserByEmail } = require('../utils/dbHelpers');

router.get('/', async (req, res) => {
    res.send('Hello world!');
})

module.exports = router;