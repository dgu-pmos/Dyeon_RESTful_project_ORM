const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const models = require('../../models');

module.exports = (passport) => {
    // strategy로부터 넘겨받은 정보들을 이용해 세션에 저장한다.
    passport.serializeUser((user, done) => {
        // 규칙 : 두 번째 인자인 done에 null, data 순으로 넣는다.(정상)
        done(null, user.userIdx); 
    });

    // 페이지 접근마다 deserialize를 이용해 세션을 확인하고 내부의 정보들을 활용한다.
    passport.deserializeUser((idx, done) => {
        done(null, idx);
    });

    local(passport);
    kakao(passport);
};