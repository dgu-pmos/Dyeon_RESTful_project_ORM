var express = require('express');
var router = express.Router({mergeParams: true});
const utils = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const models = require('../../models');
const { isLoggedIn, isNotLoggedIn } = require('../../module/passport/Log');
const passport = require('passport');
const bcrypt = require('bcrypt');

// 로그인 form을 보여주기 위한 route
router.get('/local/signin', (req, res) => {
    res.render('login');
})

// 로그아웃 route
router.get('/local/signout', isLoggedIn, (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

// 카카오 로그인 페이지 접속을 위한 route
router.get('/kakao', (req, res) => {
    res.render('kakao');
})

// passport.authenticate 메소드를 이용해 kakaoStrategy를 호출한다.
// 세션이 존재하지 않는 상태인지 isNotLoggedIn으로 확인한다.
router.get('/kakao/signin', isNotLoggedIn, passport.authenticate('kakao-login'));

// 카카오 로그인을 끝내고 처리하는 콜백함수
// 세션이 존재하지 않는 상태인지 isNotLoggedIn으로 확인한다.
router.get('/kakao/signin/callback', isNotLoggedIn, passport.authenticate('kakao-login', {
    successRedirect: '/success',
    failureRedirect: '/fail'
}));

// local login route
router.post('/local/signin', isNotLoggedIn, (req, res, next) => {
    // local Strategy를 호출
    passport.authenticate('local', (authError, user, info) => {
        if(authError){
            return next(authError);
        }
        if(!user){
            res.redirect('/fail');
        }
        // 문제가 없다면 login 메소드를 이용해 세션 저장
        return req.login(user, (loginError) => {
            if (loginError){
                return next(loginError);
            }
            return res.redirect('/success');
        });
    })(req, res, next);
});

// 회원가입 라우트
router.post('/local/signup', isNotLoggedIn, async (req, res, next) => {
    const {email, password, name} = req.body;
    if(!email || !password || !name){
        const missParameters = Object.entries({email, password, name})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }
    // 존재하는 계정인지 확인한다.
    const CheckUser = await models.User.findOne({ where: {
        email : email
    }});
    // DB 오류
    if(CheckUser===undefined){
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.DB_ERROR));    
        return;
    }
    // 유저가 있는 경우
    if(CheckUser!=null){   
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.ALREADY_ID));
        return;
    }
    // bcrypt를 이용해 hash 처리한다.
    const hash = await bcrypt.hash(password, 12);
    const signupResult = await models.User.create({email: email, name: name, password: hash});
    // insert 실패한 경우
    if(!signupResult){  
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.SIGN_UP_FAIL));
        return;
    }else{
        res.status(statusCode.OK).send(utils.successTrue(responseMessage.SIGN_UP_SUCCESS, signupResult));
        return;
    }
});

module.exports = router;
