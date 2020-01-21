var express = require('express');
var router = express.Router({
    mergeParams: true
});
// jwt token을 검증하기 위한 미들웨어
// const authUtil = require('../../module/utils/authUtil');
// 성공, 실패 메세지 포맷 설정 모듈
const utils = require('../../module/utils/utils');
// 응답 메세지 모음 모듈
const responseMessage = require('../../module/utils/responseMessage');
// 응답 코드 모음 모듈
const statusCode = require('../../module/utils/statusCode');
const models = require('../../models');
const sequelize = require('sequelize');
const {
    isLoggedIn,
    isNotLoggedIn
} = require('../../module/passport/Log');

var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

// comments로 넘겨주는 라우트
router.use('/:boardIdx/comments', require('./Comments'));
// likes로 넘겨주는 라우트
router.use('/:boardIdx/likes', require('./Likes'));

router.get('/', isLoggedIn, async (req, res) => {
    res.render('write_board');
});

router.get('/:boardIdx/edit', isLoggedIn, async (req, res) => {
    res.render('edit_board', {boardIdx: req.params.boardIdx});
});

// 게시글 전체 조회 라우트
router.get('/pages/:page', isLoggedIn, async (req, res) => {
    const page = (3 * Number(req.params.page) - 3);

    // 파라미터에 page가 없다면
    if (page === undefined) {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE('page number')));
        return;
    }
    // 게시글 전체 조회 함수 호출
    let result = await models.Board.findAll({
        where: {
            active: 1
        },
        limit: 3,
        offset: (3 * Number(req.params.page) - 3)
    });

    // 조회에 실패했다면
    if (!result) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_READ_ALL_FAIL));
        return;
    }

    const maxPage = await models.Board.findAll({
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('boardIdx')), 'cnt']
        ],
        where: {
            active: 1
        }
    });

    // 최대 페이지 조회에 실패했다면
    if (!maxPage) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_READ_ALL_FAIL));
        return;
    }

    res.render('read_board', { result: JSON.stringify(result), maxPage: Math.ceil(maxPage[0].dataValues.cnt / 3), page: req.params.page });
    return;
    /*
    // 첫번째 쿼리 결과 값에 maxPage를 push한다.
    result.push({
        maxPage: Math.ceil(maxPage[0].dataValues.cnt / 3)
    });

    //res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_READ_ALL_SUCCESS, result));
    */

});

// 상세 게시글 조회 라우트
router.get('/:boardIdx', isLoggedIn, async (req, res) => {
    const userIdx = req.user.userIdx;
    const boardIdx = Number(req.params.boardIdx);
    // miss parameter가 있는지 검사한다.
    if(!boardIdx || !userIdx){
        const missParameters = Object.entries({boardIdx, userIdx})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }
    // 게시글 상세 조회 함수 호출
    let result = await models.Board.findAll({
        include: [models.Comment],
        where: {
            boardIdx : boardIdx
        },
        order: [
            [models.Comment, 'ref_comment', 'ASC'],
            [models.Comment, 'commentIdx', 'ASC']
        ]
    });
    const likes = await models.Like.findAll({
        attributes: [[sequelize.fn('COUNT', sequelize.col('boardIdx')), 'likeNum']],
        where : {
            boardIdx : boardIdx
        }
    });
    let checkLike = await models.Like.findOne({ where: {
        userIdx : userIdx,
        boardIdx : boardIdx
    }});
    // 조회에 실패했다면
    if (!result) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_READ_FAIL));
        return;
    }
    if(checkLike == null)
    {
        checkLike = 0;
    } else {
        checkLike = 1;
    }
    res.render('read_spec_board', {userIdx: userIdx, result: JSON.stringify(result[0]), likes: likes[0].dataValues.likeNum, checkLike: checkLike});
    // res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_READ_SUCCESS, result));
    return;
});

// 게시글 생성 라우트
router.post('/', isLoggedIn, async (req, res) => {
    // authUtil 미들웨어로부터 user_id 를 받는다.
    const { userIdx, name } = req.user;
    // request body로부터 게시글 입력 정보들을 받는다.
    const {
        title,
        content
    } = req.body;
    // miss parameter가 있는지 검사한다.
    if (!userIdx || !title || !content || !name) {
        const missParameters = Object.entries({
                userIdx,
                title,
                content,
                name
            })
            .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }
    // 게시글 생성 함수 호출
    const result = await models.Board.create({
        userIdx: userIdx,
        name: name,
        title: title,
        content: content,
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss")
    });

    // 생성 실패했을 때
    if (!result) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_CREATE_FAIL));
        return;
    }
    res.redirect('/boards/pages/1');
    // res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_CREATE_SUCCESS, result));
    return;
});

// 게시글 수정 라우트
router.put('/:boardIdx', isLoggedIn, async (req, res) => {
    const userIdx = req.user.userIdx;
    const {
        title,
        content,
        active
    } = req.body;
    const boardIdx = Number(req.params.boardIdx);
    const conditions = {};
    // miss parameter가 있는지 검사한다.
    if (!userIdx || !boardIdx) {
        const missParameters = Object.entries({
                userIdx,
                boardIdx
            })
            .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }
    // 만약에 수정 사항이 존재한다면, condition 배열에 push 한다.
    if (title) conditions.title = title;
    if (content) conditions.content = content;
    if (active !== undefined) conditions.active = active;
    conditions.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
    // 게시글 수정 함수 호출

    const result = await models.Board.update(conditions, {
        where: {
            userIdx: userIdx,
            boardIdx: boardIdx
        }
    });

    // 변화된 row 가 없다면
    if (result == 0) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_UPDATE_FAIL));
        return;
    }
    res.redirect('/boards/'+boardIdx);
    // res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_UPDATE_SUCCESS, result));
    return;
});

router.delete('/:boardIdx', isLoggedIn, async (req, res) => {
    const userIdx = req.user.userIdx;
    const boardIdx = Number(req.params.boardIdx);
    // miss parameter가 있는지 검사한다.
    if (!boardIdx || !userIdx) {
        const missParameters = Object.entries({
            userIdx,
            boardIdx
        })
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }

    // 게시글 삭제 함수 호출
    const result = await models.Board.destroy({
        where: {
            userIdx: userIdx,
            boardIdx: boardIdx
        }
    });

    // 삭제된 row 가 없다면
    if (!result) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_DELETE_FAIL));
        return;
    }
    res.redirect('/boards/pages/1');
    // res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_DELETE_SUCCESS, result));
    return;
});

module.exports = router;