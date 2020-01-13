const jwt = require('./jwt');
const utils = require('../../module/utils/utils');
const responseMessage = require('../../module/utils/responseMessage');
const statusCode = require('../../module/utils/statusCode');

const authMiddleware = {
/* jwt token을 이용해 authentification, data transfer를 수행하는 미들웨어 */
    // token을 검사하는 함수
    validToken: async (req, res, next) => {
        // request header로부터 token을 받는다.
        const token = req.headers.token;
        // token이 없다면 false
        if(!token) {
            return res.json(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.EMPTY_TOKEN));
        } else {
            // token을 verify 하고 return 값을 user에 담는다.
            const user = jwt.verify(token);            
            req.decoded = user;            
            // request의 decoded에 user 정보를 담고 다음 함수에 넘긴다. 
            next();
        }
    }   
};

module.exports = authMiddleware;