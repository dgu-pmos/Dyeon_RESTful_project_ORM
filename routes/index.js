var express = require('express');
var router = express.Router({
    mergeParams: true
});

router.use('/auth', require('./Auth'));
router.use('/boards', require('./Boards'));

router.get('/success', (req, res) => {
    res.send('success');
});

router.get('/fail', (req, res) => {
    res.send('fail');
});

module.exports = router;