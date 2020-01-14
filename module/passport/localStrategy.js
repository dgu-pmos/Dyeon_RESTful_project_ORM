const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const models = require('../../models');

module.exports = async (passport) => {
    // strategy 생성
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        try {
            // 사용자로부터 받은 email을 이용해 계정이 존재하는지 찾아본다.
            const exUser = await models.User.findOne({where : { email }});
            if (exUser) {
                // 계정이 존재한다면 bcrypt의 compare 메소드로 패스워드가 일치하는지 확인한다.
                // 첫번째 인자는 plaintext(사용자 입력), 두번째 인자는 hash value(DB 정보)를 넘긴다.
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