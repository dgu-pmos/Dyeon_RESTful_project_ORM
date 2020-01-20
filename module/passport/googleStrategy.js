const GoogleStrategy = require('passport-google-oauth20').Strategy;
const models = require('../../models');
require('dotenv').config();

module.exports = async (passport) => {
    passport.use(
        // strategy 생성
        new GoogleStrategy({
            // 구글로부터 받은 APP KEY
            clientID: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
            // strategy가 끝난 후 callback url
            callbackURL: '/auth/google/signin/callback',
            // 여기서 구글로부터 profile을 받고, done으로 다음 함수에 넘긴다.
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                // profile의 id를 이용해 계정이 존재하는지 확인한다.
                const exUser = await models.User.findOne({
                    where: {
                        snsId: profile.id,
                        provider: 'google'
                    }
                });
                if (exUser) {
                    // 존재한다면 찾은 계정 정보(서버 DB)를 찾아서 
                    // passport/index.js(serializeUser)에 반환한다.
                    done(null, exUser);
                } else {
                    // 존재하지 않으면, 계정을 생성하고 새 계정 정보를
                    // passport/index.js(serializeUser)에 반환한다.
                    console.log(profile);
                    const newUser = await models.User.create({
                        email : profile._json.email,
                        password: profile.id,
                        name: profile._json.name,
                        snsId: profile.id,
                        provider: 'google'
                    });
                    done(null, newUser);
                }
            } catch (error) {
                console.log(error);
                done(error);
            }
        }));
};