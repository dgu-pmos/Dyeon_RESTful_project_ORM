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
const sequelize = require('sequelize');
const { isLoggedIn, isNotLoggedIn } = require('../../../module/passport/Log');

router.get('/', isLoggedIn, async (req, res) => {
    res.render('write_comment', {boardIdx : JSON.stringify(req.params.boardIdx)});
});

router.get('/:commentIdx/edit', isLoggedIn, async (req, res) => {
    res.render('edit_comment', {boardIdx : JSON.stringify(req.params.boardIdx), commentIdx : JSON.stringify(req.params.commentIdx)});
});

router.get('/:boardIdx/edit', isLoggedIn, async (req, res) => {
    res.render('edit_board', {boardIdx: req.params.boardIdx});
});

// 댓글 생성 라우트
router.post('/', isLoggedIn, async (req, res) => {
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
    if (ref_comment!==undefined) conditions.ref_comment = ref_comment;

    // 댓글 생성 함수 호출
    const result = await models.Comment.create(conditions);

    // 실패했다면
    if(!result){
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.COMMENT_CREATE_FAIL));
        return;
    }
    res.redirect('/boards/'+boardIdx);
    // res.status(statusCode.OK).send(utils.successTrue(responseMessage.COMMENT_CREATE_SUCCESS, result));
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
    res.redirect('/boards/'+boardIdx);
    // res.status(statusCode.OK).send(utils.successTrue(responseMessage.COMMENT_UPDATE_SUCCESS, result));
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
    
    res.redirect('/boards/'+boardIdx);
    // res.status(statusCode.OK).send(utils.successTrue(responseMessage.COMMENT_DELETE_SUCCESS, result));
    return;
});

module.exports = router;