var express = require('express');
var router = express.Router({mergeParams: true});

/* GET home page. */
router.use('/signup', require('./signup'));
router.use('/signin', require('./signin'));

module.exports = router;
