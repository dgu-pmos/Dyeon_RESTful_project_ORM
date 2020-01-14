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

// 댓글 생성 라우트
router.post('/', authUtil.validToken, async (req, res) => {
    const conditions = {};
    const userIdx = req.decoded.userIdx;
    const {content, ref_comment} = req.body;
    const boardIdx = Number(req.params.boardIdx);
    // miss parameter가 있는지 검사한다.
    if(!boardIdx || !userIdx || !content){
        const missParameters = Object.entries({boardIdx, userIdx, content})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }
    if (boardIdx) conditions.boardIdx = boardIdx;
    if (userIdx) conditions.userIdx = userIdx;
    if (content) conditions.content = content;
    if (ref_comment!==undefined) conditions.ref_comment = ref_comment;

    // 댓글 생성 함수 호출
    const result = await models.Comment.create(conditions);

    // 실패했다면
    if(!result){
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.COMMENT_CREATE_FAIL));
        return;
    }

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.COMMENT_CREATE_SUCCESS, result));
    return;
});

// 댓글 수정 라우트
router.put('/:commentIdx', authUtil.validToken, async (req, res) => {
    const userIdx = req.decoded.userIdx;
    const content = req.body.content;
    const commentIdx = Number(req.params.commentIdx);
    // miss parameter가 있는지 검사한다.
    if(!userIdx || !commentIdx || !content){
        const missParameters = Object.entries({userIdx, commentIdx, content})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }
    // 댓글 수정 함수 호출
    const result = await models.Comment.update(
    {
        content : content
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

// 댓글 전체 조회 라우트
router.get('/', async (req, res) => {
    const boardIdx = Number(req.params.boardIdx);
    // miss parameter가 있는지 검사한다.
    if(!boardIdx){
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE('boardIdx')));
        return;
    }

    // 댓글 조회 함수 호출
    const result = await models.Comment.findAll({
        where: {
            boardIdx : boardIdx
        }
    }
);
    // 실패했다면
    if(!result){
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.COMMENT_READ_FAIL));
        return;
    }

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.COMMENT_READ_SUCCESS, result));
    return;
});

// 댓글 삭제 라우트
router.delete('/:commentIdx', authUtil.validToken, async (req, res) => {
    const userIdx = req.decoded.userIdx;
    const commentIdx = Number(req.params.commentIdx);
    // miss parameter가 있는지 검사한다.
    if(!commentIdx || !userIdx){
        const missParameters = Object.entries({userIdx, commentIdx})
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }
    // 댓글 삭제 함수 호출
    let result = await models.Comment.findOne({
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