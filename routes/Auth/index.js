var express = require('express');
var router = express.Router({
    mergeParams: true
});
const utils = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const models = require('../../models');
const {
    isLoggedIn,
    isNotLoggedIn
} = require('../../module/passport/Log');
const passport = require('passport');
const bcrypt = require('bcrypt');

var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

// 로그아웃 route
router.get('/signout', isLoggedIn, (req, res) => {
    req.logout();
    req.session.destroy();
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.SIGN_OUT_SUCCESS));
});

// passport.authenticate 메소드를 이용해 kakaoStrategy를 호출한다.
// 세션이 존재하지 않는 상태인지 isNotLoggedIn으로 확인한다.
router.get('/kakao/signin', isNotLoggedIn, passport.authenticate('kakao-login'));

// 카카오 로그인을 끝내고 처리하는 콜백함수
// 세션이 존재하지 않는 상태인지 isNotLoggedIn으로 확인한다.
router.get('/kakao/signin/callback', isNotLoggedIn, passport.authenticate('kakao-login'), (req, res) => {
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.SIGN_IN_SUCCESS));
});

// passport.authenticate 메소드를 이용해 facebookStrategy를 호출한다.
// 세션이 존재하지 않는 상태인지 isNotLoggedIn으로 확인한다.
router.get('/facebook/signin', isNotLoggedIn, passport.authenticate('facebook', {
    // authType: 'rerequest'는 매번 로그인할 때마다 뒤의 public_profile과 email을 달라고 요청하는 것이다.
    // 이 설정을 해야 실수로 사용자가 요청을 거절했을 때 다음 로그인 시 다시 얻어올 수 있다.
    // scope는 사용자에 대한 정보로 무엇을 요청할 지 정하는 부분
    authType: 'rerequest', 
    scope: ['public_profile', 'email'],
}));

// 카카오 로그인을 끝내고 처리하는 콜백함수
// 세션이 존재하지 않는 상태인지 isNotLoggedIn으로 확인한다.
router.get('/facebook/signin/callback', isNotLoggedIn, passport.authenticate('facebook'), (req, res) => {
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.SIGN_IN_SUCCESS));
});

// passport.authenticate 메소드를 이용해 facebookStrategy를 호출한다.
// 세션이 존재하지 않는 상태인지 isNotLoggedIn으로 확인한다.
router.get('/naver/signin', isNotLoggedIn, passport.authenticate('naver'));

// 카카오 로그인을 끝내고 처리하는 콜백함수
// 세션이 존재하지 않는 상태인지 isNotLoggedIn으로 확인한다.
router.get('/naver/signin/callback', isNotLoggedIn, passport.authenticate('naver'), (req, res) => {
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.SIGN_IN_SUCCESS));
});

// passport.authenticate 메소드를 이용해 facebookStrategy를 호출한다.
// 세션이 존재하지 않는 상태인지 isNotLoggedIn으로 확인한다.
router.get('/google/signin', isNotLoggedIn, passport.authenticate('google', {
    scope: ["profile", "email"]
}));

// 카카오 로그인을 끝내고 처리하는 콜백함수
// 세션이 존재하지 않는 상태인지 isNotLoggedIn으로 확인한다.
router.get('/google/signin/callback', isNotLoggedIn, passport.authenticate('google'), (req, res) => {
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.SIGN_IN_SUCCESS));
});

// local login route
router.post('/local/signin', isNotLoggedIn, (req, res, next) => {
    // authenticate는 passport에서 제공하는 함수
    // local Strategy를 호출
    passport.authenticate('local', (authError, user, info) => {
        if (authError) {
            return next(authError);
        }
        if (!user) {
            res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.NO_USER));
        }
        // 문제가 없다면 login 메소드를 이용해 세션 저장
        return req.login(user, (loginError) => {
            if (loginError) {
                return next(loginError);
            }
            res.status(statusCode.OK).send(utils.successTrue(responseMessage.SIGN_IN_SUCCESS));
        });
    })(req, res, next);
});

// 회원가입 라우트
router.post('/local/signup', isNotLoggedIn, async (req, res, next) => {
    const {
        email,
        password,
        name
    } = req.body;
    if (!email || !password || !name) {
        const missParameters = Object.entries({
                email,
                password,
                name
            })
            .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }
    // 존재하는 계정인지 확인한다.
    const CheckUser = await models.User.findOne({
        where: {
            email: email,
            provider: 'local'
        }
    });
    // DB 오류
    if (CheckUser === undefined) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.DB_ERROR));
        return;
    }
    // 유저가 있는 경우
    if (CheckUser != null) {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.ALREADY_ID));
        return;
    }
    // bcrypt를 이용해 hash 처리한다.
    const hash = await bcrypt.hash(password, 12);
    const signupResult = await models.User.create({
        email: email,
        name: name,
        password: hash,
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        provider: 'local'
    });
    // insert 실패한 경우
    if (!signupResult) {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.SIGN_UP_FAIL));
        return;
    } else {
        res.status(statusCode.OK).send(utils.successTrue(responseMessage.SIGN_UP_SUCCESS));
        return;
    }
});

module.exports = router;
