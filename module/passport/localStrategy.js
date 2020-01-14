const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const models = require('../../models');

module.exports = async (passport) => {
    // strategy를 이용해 로그인 처리를 한다. 처리가 끝난 결과물을 serializeUser에 넘긴다.
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        try {
            const exUser = await models.User.findOne({where : { email }});
            if (exUser) {
                const result = await bcrypt.compare(password, exUser.password);
                if (result) {
                    done(null, exUser);
                } else {
                    done(null, false, { message : '비밀번호 일치하지 않음'});
                }
            } else {
                done(null, false, { message : '가입되지 않은 회원'});
            }
        } catch (error) {
            console.log(error);
            done(error);
        }
    }));
};