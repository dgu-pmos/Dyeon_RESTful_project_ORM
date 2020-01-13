var express = require('express');
var router = express.Router({mergeParams: true});

// jwt token을 검증하기 위한 미들웨어
const authUtil = require('../../module/utils/authUtil');
// 성공, 실패 메세지 포맷 설정 모듈
const utils = require('../../module/utils/utils');
// 응답 메세지 모음 모듈
const responseMessage = require('../../module/utils/responseMessage');
// 응답 코드 모음 모듈
const statusCode = require('../../module/utils/statusCode');

const Board = require('../../model/Board');

// comments로 넘겨주는 라우트
router.use('/:boardIdx/comments', require('./Comments'));
// likes로 넘겨주는 라우트
router.use('/:boardIdx/likes', require('./Likes'));

// 게시글 생성 라우트
router.post('/', authUtil.validToken, async (req, res) => {
    // authUtil 미들웨어로부터 user_id 를 받는다.
    const userIdx = req.decoded.userIdx;
    // request body로부터 게시글 입력 정보들을 받는다.
    const {title, content} = req.body;
    const active = 1;
    // miss parameter가 있는지 검사한다.
    if(!userIdx || !title || !content){
        const missParameters = Object.entries({userIdx, title, content})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }

    const json = {userIdx, title, content, active};
    // 게시글 생성 함수 호출
    const result = await Board.create(json);
    // 생성 실패했을 때
    if(!result){
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_CREATE_FAIL));
        return;
    }

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_CREATE_SUCCESS, result));
    return;
});

// 게시글 수정 라우트
router.put('/:boardIdx', authUtil.validToken, async (req, res) => {
    const userIdx = req.decoded.userIdx;
    const {title, content, active} = req.body;
    const boardIdx = Number(req.params.boardIdx);
    // miss parameter가 있는지 검사한다.
    if(!userIdx || !boardIdx){
        const missParameters = Object.entries({userIdx, boardIdx})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }

    const json = {boardIdx, userIdx, title, content, active};
    
    // 게시글 수정 함수 호출
    const result = await Board.update(json);

    // 변화된 row 가 없다면
    if(!result || result.affectedRows == '0'){
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_UPDATE_FAIL));
        return;
    }
    
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_UPDATE_SUCCESS, result));
    return;
});

// 게시글 전체 조회 라우트
router.get('/pages/:page', async (req, res) => {
    const page = Number(req.params.page);
    if(!page){
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE('page number')));
        return;
    }

    // 게시글 전체 조회 함수 호춣
    let result = await Board.readAll(page);

    // 조회에 실패했다면
    if(!result){
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_READ_ALL_FAIL));
        return;
    }

    let maxPage = await Board.maxPage();
    maxPage[0].cnt = maxPage[0].cnt / 3;

    // 최대 페이지 조회에 실패했다면
    if(!result){
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_READ_ALL_FAIL));
        return;
    }

    result.push({maxPage : maxPage[0].cnt});

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_READ_ALL_SUCCESS, result));
    return;
});

// 상세 게시글 조회 라우트
router.get('/:boardIdx', async (req, res) => {
    const boardIdx = Number(req.params.boardIdx);
    // miss parameter가 있는지 검사한다.
    if(!boardIdx){
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE('boardIdx')));
        return;
    }

    // 게시글 상세 조회 함수 호출
    const result = await Board.read(boardIdx);

    // 조회에 실패했다면
    if(!result){
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_READ_FAIL));
        return;
    }
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_READ_SUCCESS, result));
    return;
});

router.delete('/:boardIdx', authUtil.validToken, async (req, res) => {
    const userIdx = req.decoded.userIdx;
    const boardIdx = Number(req.params.boardIdx);
    // miss parameter가 있는지 검사한다.
    if(!boardIdx || !userIdx){
        const missParameters = Object.entries({userIdx, boardIdx})
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }

    const json = {userIdx, boardIdx};
    // 게시글 삭제 함수 호출
    const result = await Board.remove(json);
    
    // 삭제된 row 가 없다면
    if(!result || result.affectedRows == '0'){
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_DELETE_FAIL));
        return;
    }    

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_DELETE_SUCCESS, result));
    return;
});

module.exports = router;