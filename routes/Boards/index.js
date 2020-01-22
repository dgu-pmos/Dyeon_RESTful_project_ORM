var express = require('express');
var router = express.Router({ mergeParams: true });
// 성공, 실패 메세지 포맷 설정 모듈
const utils = require('../../module/utils/utils');
// 응답 메세지 모음 모듈
const responseMessage = require('../../module/utils/responseMessage');
// 응답 코드 모음 모듈
const statusCode = require('../../module/utils/statusCode');
// miss parameter 탐색 모듈
const missParameter = require('../../module/utils/missParameter');
// sequelize scheme 모듈
const sequelize = require('sequelize');
const models = require('../../models');
// 로그인 상태 검증 미들웨어
const { isLoggedIn } = require('../../module/passport/Log');
// 시간 객체를 생성하는 모듈
var moment = require('moment'); require('moment-timezone'); moment.tz.setDefault("Asia/Seoul");
// comments로 넘겨주는 라우트
router.use('/:boardIdx/comments', require('./Comments'));
// likes로 넘겨주는 라우트
router.use('/:boardIdx/likes', require('./Likes'));

// 게시글 전체 조회 라우트
router.get('/pages/:page', isLoggedIn, async (req, res) => {
    const page = Number(req.params.page);
    // 파라미터에 page가 없다면
    if (!page) {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE('page number')));
        return;
    }
    // 게시글 전체 조회 함수
    let result = await models.Board.findAll({
        // where : 공개인 게시글
        where: {
            active: 1
        },
        // 페이지 당 3개의 게시글
        limit: 3,
        // (3 * Number(page) - 3) 만큼 생략
        offset: (3 * page - 3)
    });
    // 조회에 실패했다면
    if (!result) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_READ_ALL_FAIL));
        return;
    }
    // 최대 페이지 수를 구하는 함수
    const maxPage = await models.Board.findAll({
        attributes: [
            // 게시글 수를 count한 값을 cnt에 저장
            [sequelize.fn('COUNT', sequelize.col('boardIdx')), 'cnt']
        ],
        where: {
            // count 조건은 공개인 글
            active: 1
        }
    });
    // 최대 페이지 조회에 실패했다면
    if (!maxPage) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_READ_ALL_FAIL));
        return;
    }
    // 결과 값에 현재 page와 maxPage를 push한다.
    result.push({
        maxPage: Math.ceil(maxPage[0].dataValues.cnt / 3),
        page: page
    });
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_READ_ALL_SUCCESS, result));
    return;
});

// 상세 게시글 조회 라우트
router.get('/:boardIdx', isLoggedIn, async (req, res) => {
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
    // 게시글 상세 조회 함수 호출
    let result = await models.Board.findAll({
        include: [models.Comment],
        where: {
            boardIdx : json.boardIdx
        },
        order: [
            [models.Comment, 'ref_comment', 'ASC'],
            [models.Comment, 'commentIdx', 'ASC']
        ]
    });
    // like 수를 count 하는 query
    const likes = await models.Like.findAll({
        attributes: [[sequelize.fn('COUNT', sequelize.col('boardIdx')), 'likeNum']],
        where : {
            boardIdx : json.boardIdx
        }
    });
    // like 했는지 check 하는 query 
    let checkLike = await models.Like.findOne({ where: {
        userIdx : json.userIdx,
        boardIdx : json.boardIdx
    }});
    // 조회에 실패했다면
    if (!result) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_READ_FAIL));
        return;
    }
    // check 결과 query 값이 null이라면 0, 있다면 1
    if(checkLike == null)
    {
        checkLike = 0;
    } else {
        checkLike = 1;
    }
    // 결과 값에 userIdx, like 수, like flag를 push 한다.
    result.push({
        userIdx: json.userIdx,
        likes: likes[0].dataValues.likeNum,
        checkLike: checkLike
    });
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_READ_SUCCESS, result));
    return;
});

// 게시글 생성 라우트
router.post('/', isLoggedIn, async (req, res) => {
    let json = {};
    // isLoggedIn 미들웨어로부터 user 정보를 받는다.
    json.userIdx = req.user.userIdx;
    json.name = req.user.name;
    // request body로부터 게시글 입력 정보들을 받는다.
    json.title = req.body.title;
    json.content = req.body.content;
    // miss parameter가 있는지 검사한다.
    const missParam = missParameter(json);
    if(missParam) {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParam)));
    }
    // 게시글 생성 함수 호출
    const result = await models.Board.create({
        userIdx: json.userIdx,
        name: json.name,
        title: json.title,
        content: json.content,
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss")
    });
    // 생성 실패했을 때
    if (!result) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_CREATE_FAIL));
        return;
    }
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_CREATE_SUCCESS, result));
    return;
});

// 게시글 수정 라우트
router.put('/:boardIdx', isLoggedIn, async (req, res) => {
    let json = {};
    let conditions = {};
    // isLoggedIn 미들웨어로부터 user 정보를 받는다.
    json.userIdx = req.user.userIdx;
    json.name = req.user.name;
    // url parameter로부터 게시글 입력 정보들을 받는다.
    json.boardIdx = Number(req.params.boardIdx);
    // miss parameter가 있는지 검사한다.
    const missParam = missParameter(json);
    if(missParam) {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParam)));
    }
    // request body로부터 게시글 입력 정보들을 받는다.
    json.title = req.body.title;
    json.content = req.body.content;
    // 만약에 수정 사항이 존재한다면, condition 배열에 push 한다.
    if (json.title) conditions.title = json.title;
    if (json.content) conditions.content = json.content;
    conditions.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
    // 게시글 수정 함수 호출
    const result = await models.Board.update(conditions, {
        where: {
            userIdx: json.userIdx,
            boardIdx: json.boardIdx
        }
    });
    // 변화된 row 가 없다면
    if (result.data == 0) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_UPDATE_FAIL));
        return;
    }
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_UPDATE_SUCCESS, result));
    return;
});

router.delete('/:boardIdx', isLoggedIn, async (req, res) => {
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
    // 게시글 삭제 함수 호출
    const result = await models.Board.destroy({
        where: {
            userIdx: json.userIdx,
            boardIdx: json.boardIdx
        }
    });
    // 삭제된 row 가 없다면
    if (!result) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_DELETE_FAIL));
        return;
    }
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_DELETE_SUCCESS, result));
    return;
});

module.exports = router;