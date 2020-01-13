var express = require('express');
var router = express.Router({
    mergeParams: true
});

router.use('/auth', require('./Auth'));
router.use('/boards', require('./Boards'));

module.exports = router;