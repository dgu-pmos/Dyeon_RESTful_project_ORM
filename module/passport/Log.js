const utils = require('../utils/utils');
const responseMessage = require('../utils/responseMessage');
const statusCode = require('../utils/statusCode');

exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()){
        next();
    }else{
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.NEED_SIGN_IN));
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    }else{
        res.redirect('/success');
    }
};