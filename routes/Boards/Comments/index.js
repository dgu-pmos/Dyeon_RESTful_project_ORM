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

// 댓글 생성 라우트
router.post('/', isLoggedIn, async (req, res) => {
    let json = {};
    const conditions = {};
    // isLoggedIn 미들웨어로부터 user 정보를 받는다.
    json.userIdx = req.user.userIdx;
    json.name = req.user.name;
    // request body로부터 게시글 입력 정보들을 받는다.
    json.ref_comment = req.body.ref_comment;
    json.content = req.body.content;
    // url parameter로부터 게시글 입력 정보들을 받는다.
    json.boardIdx = Number(req.params.boardIdx);
    // miss parameter가 있는지 검사한다.
    const missParam = missParameter(json);
    if(missParam) {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParam)));
    }
    if (json.boardIdx) conditions.boardIdx = json.boardIdx;
    if (json.userIdx) conditions.userIdx = json.userIdx;
    if (json.name) conditions.name = json.name;
    if (json.content) conditions.content = json.content;
    // 만약 ref_comment가 'self'가 아니라면 참조할 부모가 있다는 것을 의미 
    if (json.ref_comment !== 'self') conditions.ref_comment = json.ref_comment;
    conditions.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
    conditions.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
    // 댓글 생성 함수 호출
    const result = await models.Comment.create(conditions);
    // 만약 'self' 라면 자기 idx를 ref_comment에 넣는다.
    if (json.ref_comment == 'self') {  
        await models.Comment.update (
            { ref_comment : result.commentIdx },
            { where: { commentIdx : result.commentIdx } }
        );
    }
    // 실패했다면
    if(!result){
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.COMMENT_CREATE_FAIL));
        return;
    }
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.COMMENT_CREATE_SUCCESS, result));
    return;
});

// 댓글 수정 라우트
router.put('/:commentIdx', isLoggedIn, async (req, res) => {
    let json = {};
    // isLoggedIn 미들웨어로부터 user 정보를 받는다.
    json.userIdx = req.user.userIdx;
    // request body로부터 게시글 입력 정보들을 받는다.
    json.content = req.body.content;
    // url parameter로부터 댓글 정보들을 받는다.
    json.commentIdx = Number(req.params.commentIdx);
    // miss parameter가 있는지 검사한다.
    const missParam = missParameter(json);
    if(missParam) {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParam)));
    }
    // 댓글 수정 함수 호출
    const result = await models.Comment.update(
    {
        content : json.content,
        updatedAt : moment().format("YYYY-MM-DD HH:mm:ss"),
    },
        { where: {
            userIdx : json.userIdx,
            commentIdx : json.commentIdx
    }});
    // 수정된 row 가 없다면
    if(!result){
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.COMMENT_UPDATE_FAIL));
        return;
    }
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.COMMENT_UPDATE_SUCCESS, result));
    return;
});

// 댓글 삭제 라우트
router.delete('/:commentIdx', isLoggedIn, async (req, res) => {
    let json = {};
    // url parameter로부터 게시글 입력 정보들을 받는다.
    json.commentIdx = Number(req.params.commentIdx);
    // miss parameter가 있는지 검사한다.
    const missParam = missParameter(json);
    if(missParam) {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParam)));
    }
    // 댓글 삭제 함수 호출
    let result = await models.Comment.destroy({
        where: {
            commentIdx : json.commentIdx
        }
    });
    // 삭제된 row 가 없다면
    if(!result){
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.COMMENT_DELETE_FAIL));
        return;
    }  
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.COMMENT_DELETE_SUCCESS, result));
    return;
});

module.exports = router;