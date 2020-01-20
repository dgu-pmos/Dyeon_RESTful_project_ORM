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

// 좋아요 생성 라우트
router.post('/', isLoggedIn, async (req, res) => {
    const userIdx = req.user.userIdx;
    const boardIdx = Number(req.params.boardIdx);
    // miss parameter가 있는지 검사한다.
    if(!boardIdx || !userIdx){
        const missParameters = Object.entries({boardIdx, userIdx})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }

    // 좋아요 생성 함수 호출
    const result = await models.Like.create({userIdx: userIdx, boardIdx: boardIdx});
    // 실패했다면
    if(!result){
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.LIKE_CREATE_FAIL));
        return;
    }
    res.redirect('/boards/'+boardIdx);
    // res.status(statusCode.OK).send(utils.successTrue(responseMessage.LIKE_CREATE_SUCCESS, result));
    return;
});

// 좋아요 삭제 라우트
router.delete('/', isLoggedIn, async (req, res) => {
    const userIdx = req.user.userIdx;
    const boardIdx = Number(req.params.boardIdx);
    // miss parameter가 있는지 검사한다.
    if(!boardIdx || !userIdx){
        const missParameters = Object.entries({userIdx, boardIdx})
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }

    // 좋아요 삭제 함수 호출
    const result = await models.Like.destroy({
        where: {
        userIdx : userIdx,
        boardIdx : boardIdx
        }
    });
    
    // 삭제된 row 가 없다면
    if(!result){
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.LIKE_DELETE_FAIL));
        return;
    }
    res.redirect('/boards/'+boardIdx);
    // res.status(statusCode.OK).send(utils.successTrue(responseMessage.LIKE_DELETE_SUCCESS, result));
    return;
});

module.exports = router;