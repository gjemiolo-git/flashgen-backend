const { Router } = require('express');
const router = Router({ mergeParams: true });

router.get('/', (req, res) => {
    return res.send('This is auth route');
})

module.exports = router;