var express = require('express');
var router =  express.Router({mergeParams: true});

const utils = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');

const User = require('../../model/User');
const jwt = require('../../module/utils/jwt');

// 로그인 라우트
router.post('/', async(req, res) => {
    // request body로부터 로그인 정보를 받는다.
    const { email, password }  = req.body; 
    // miss parameter가 있는지 검사한다.
    if(!email || !password){
        // entries 메소드는 객체가 가지고 있는 모든 프로퍼티를 키와 값 쌍으로 배열 형태로 반환해준다.
        const missParameters = Object.entries({email, password})
        // 배열로 바꾼 상태에서 value 값이 undefined 인 경우, missParameters 변수에 추가된다.
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
    }
    // 존재하는 계정인지 확인한다.
    const selectResult = await User.checkUser(email);
    // DB 에러
    if(!selectResult){
        res.status(statusCode.DB_ERROR).send(utils.successFalse(responseMessage.DB_ERROR));
    }
    // 유저가 없을 때
    if(selectResult.length == 0){
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE("해당("+email+")")));
    }
    // 유저가 있을 때
    else{
        // 패스워드가 일치하지 않는다면 에러 메세지 출력
        const passwordChecking = await User.checkPassword(email, password);
        if(passwordChecking.length == 0){
            res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.MISS_MATCH_PW)); 
        }else{
            const token = await jwt.sign(selectResult[0]);
            res.status(statusCode.OK).send(utils.successTrue(responseMessage.SUCCESS_USER_SIGNIN, token));    
        }
    }    
});

module.exports = router;