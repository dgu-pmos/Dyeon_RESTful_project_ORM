const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const models = require('../../models');

module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user.userIdx);
    });

    passport.deserializeUser((id, done) => {
        models.User.findOne( { where : { userIdx: id } })
        .then(user => done(null, user))
        .catch(err => done(err));
    });

    local(passport);
    kakao(passport);
};