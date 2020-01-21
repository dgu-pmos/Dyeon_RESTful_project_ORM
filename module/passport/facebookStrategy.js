const FacebookStrategy = require('passport-facebook').Strategy;
const models = require('../../models');
var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");
require('dotenv').config();

module.exports = async (passport) => {
    passport.use(
        // strategy 생성
        new FacebookStrategy({
            // facebook으로부터 받은 APP KEY
            clientID: process.env.FACEBOOK_ID,
            clientSecret: process.env.FACEBOOK_SECRET,
            // strategy가 끝난 후 callback url
            callbackURL: '/auth/facebook/signin/callback',
            // req를 콜백함수에게 넘긴다.
            passReqToCallback: true, 
            profileFields: ['id', 'emails', 'displayName']
            // 여기서 페이스북으로부터 profile을 받고, done으로 다음 함수에 넘긴다.
        }, async (req, accessToken, refreshToken, profile, done) => {
            try {
                // profile의 id를 이용해 계정이 존재하는지 확인한다.
                const exUser = await models.User.findOne({
                    where: {
                        snsId: profile.id,
                        provider: 'facebook'
                    }
                });
                if (exUser) {
                    console.log(moment().format("YYYY-MM-DD HH:mm:ss"))
                    // 존재한다면 찾은 계정 정보(서버 DB)를 찾아서 
                    // passport/index.js(serializeUser)에 반환한다.
                    done(null, exUser);
                } else {
                    console.log(moment().format("YYYY-MM-DD HH:mm:ss"))
                    // 존재하지 않으면, 계정을 생성하고 새 계정 정보를
                    // passport/index.js(serializeUser)에 반환한다.
                    const newUser = await models.User.create({
                        email : profile._json.email,
                        password: profile._json.id,
                        name: profile._json.name,
                        snsId: profile._json.id,
                        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
                        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
                        provider: 'facebook'
                    });
                    done(null, newUser);
                }
            } catch (error) {
                console.log(error);
                done(error);
            }
        }));
};