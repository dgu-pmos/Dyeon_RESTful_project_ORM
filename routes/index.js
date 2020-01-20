var express = require('express');
var router = express.Router({
    mergeParams: true
});

router.use('/auth', require('./Auth'));
router.use('/boards', require('./Boards'));

router.get('/', (req, res) => {
    res.render('index');
});

module.exports = router;