const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const models = require('../../models');

module.exports = (passport) => {
    // strategy에서 넘겨받은 정보들을 이용해 세션에 저장한다.
    passport.serializeUser((user, done) => {
        console.log('saved');
        done(null, user);
    });

    // 페이지 접근마다 deserialize를 이용해 정보를 가져온다.
    passport.deserializeUser((user, done) => {
        console.log('get id');
        models.User.findOne( { where : { userIdx: user.userIdx } })
        .then(user => done(null, user))
        .catch(err => done(err));
    });

    local(passport);
    kakao(passport);
};