var express = require('express');
var router = express.Router({mergeParams: true});
// jwt token을 검증하기 위한 미들웨어
const authUtil = require('../../../module/utils/authUtil');
// 성공, 실패 메세지 포맷 설정 모듈
const utils = require('../../../module/utils/utils');
// 응답 메세지 모음 모듈
const responseMessage = require('../../../module/utils/responseMessage');
// 응답 코드 모음 모듈
const statusCode = require('../../../module/utils/statusCode');

const models = require('../../../models');
const { isLoggedIn } = require('../../../module/passport/Log');

var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

// 댓글 생성 라우트
router.post('/', isLoggedIn, async (req, res) => {
    // 댓글 수정할 값을 담을 빈 객체
    const conditions = {};
    const { userIdx, name } = req.user;
    const {content, ref_comment} = req.body;
    const boardIdx = Number(req.params.boardIdx);
    // miss parameter가 있는지 검사한다.
    if(!boardIdx || !userIdx || !name || !content){
        const missParameters = Object.entries({boardIdx, userIdx, name, content})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }

    if (boardIdx) conditions.boardIdx = boardIdx;
    if (userIdx) conditions.userIdx = userIdx;
    if (name) conditions.name = name;
    if (content) conditions.content = content;
    // 만약 ref_comment가 'self'가 아니라면 참조할 부모가 있다는 것을 의미 
    if (ref_comment !== 'self') conditions.ref_comment = ref_comment;
    conditions.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
    conditions.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

    // 댓글 생성 함수 호출
    const result = await models.Comment.create(conditions);
    // 만약 'self' 라면 자기 idx를 ref_comment에 넣는다.
    if (ref_comment == 'self') {  
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
    const userIdx = req.user.userIdx;
    const boardIdx = Number(req.params.boardIdx);
    const content = req.body.content;
    const commentIdx = Number(req.params.commentIdx);
    // miss parameter가 있는지 검사한다.
    if(!userIdx || !boardIdx || !commentIdx || !content){
        const missParameters = Object.entries({userIdx, boardIdx, commentIdx, content})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }
    // 댓글 수정 함수 호출
    const result = await models.Comment.update(
    {
        content : content,
        updatedAt : moment().format("YYYY-MM-DD HH:mm:ss"),
    },
        { where: {
            userIdx : userIdx,
            commentIdx : commentIdx
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
    const userIdx = req.user.userIdx;
    const boardIdx = Number(req.params.boardIdx);
    const commentIdx = Number(req.params.commentIdx);
    // miss parameter가 있는지 검사한다.
    if(!commentIdx || !boardIdx || !userIdx){
        const missParameters = Object.entries({userIdx, boardIdx, commentIdx})
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }
    // 댓글 삭제 함수 호출
    let result = await models.Comment.destroy({
        where: {
            commentIdx : commentIdx
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