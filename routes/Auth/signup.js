var express = require('express');
var router =  express.Router({mergeParams: true});

const utils = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage')
const User = require('../../model/User');

// 회원가입 라우트
router.post('/', async (req, res) => {
    // request body로부터 가입 정보를 받는다.
    const {email, password, name} = req.body;
    const json = {email, password, name};
    // miss parameter가 있는지 검사한다.
    if(!email || !password || !name){
        const missParameters = Object.entries({email, password, name})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }
    // 존재하는 계정인지 확인한다.
    CheckUser = await User.checkUser(email);
    // DB 에러
    if(!CheckUser){
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.DB_ERROR));    
        return;
    }
    // 유저가 있는 경우
    if(CheckUser.length != 0){   
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.ALREADY_ID));
        return;
    }

    signupResult = await User.signup(json);
    // insert 실패한 경우
    if(!signupResult){  
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.SIGN_UP_FAIL));
        return;
    }else{
        res.status(statusCode.OK).send(utils.successTrue(responseMessage.SIGN_UP_SUCCESS, signupResult));
        return;
    } 
});

module.exports = router;