var express = require('express');
var router = express.Router({mergeParams: true});
// 성공, 실패 메세지 포맷 설정 모듈
const utils = require('../../../module/utils/utils');
// 응답 메세지 모음 모듈
const responseMessage = require('../../../module/utils/responseMessage');
// 응답 코드 모음 모듈
const statusCode = require('../../../module/utils/statusCode');
// miss parameter 탐색 모듈
const missParameter = require('../../../module/utils/missParameter');
// sequelize scheme 모듈
const models = require('../../../models');
// 로그인 상태 검증 미들웨어
const { isLoggedIn } = require('../../../module/passport/Log');
// 시간 객체를 생성하는 모듈
var moment = require('moment'); require('moment-timezone'); moment.tz.setDefault("Asia/Seoul");

// 좋아요 생성 라우트
router.post('/', isLoggedIn, async (req, res) => {
    let json = {};
    // isLoggedIn 미들웨어로부터 user 정보를 받는다.
    json.userIdx = req.user.userIdx;
    // url parameter로부터 게시글 입력 정보들을 받는다.
    json.boardIdx = Number(req.params.boardIdx);
    // miss parameter가 있는지 검사한다.
    const missParam = missParameter(json);
    if(missParam) {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParam)));
    }
    // 좋아요 생성 함수 호출
    const result = await models.Like.create({
        userIdx: json.userIdx, 
        boardIdx: json.boardIdx, 
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss")
    });
    // 실패했다면
    if(!result){
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.LIKE_CREATE_FAIL));
        return;
    }
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.LIKE_CREATE_SUCCESS, result));
    return;
});

// 좋아요 삭제 라우트
router.delete('/', isLoggedIn, async (req, res) => {
    let json = {};
    // isLoggedIn 미들웨어로부터 user 정보를 받는다.
    json.userIdx = req.user.userIdx;
    // url parameter로부터 게시글 입력 정보들을 받는다.
    json.boardIdx = Number(req.params.boardIdx);
    // miss parameter가 있는지 검사한다.
    const missParam = missParameter(json);
    if(missParam) {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParam)));
    }
    // 좋아요 삭제 함수 호출
    const result = await models.Like.destroy({
        where: {
        userIdx : json.userIdx,
        boardIdx : json.boardIdx
        }
    });
    // 삭제된 row 가 없다면
    if(!result){
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.LIKE_DELETE_FAIL));
        return;
    }
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.LIKE_DELETE_SUCCESS, result));
    return;
});

module.exports = router;