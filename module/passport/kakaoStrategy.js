const KakaoStrategy = require('passport-kakao').Strategy;
const models = require('../../models');
require('dotenv').config();

module.exports = async (passport) => {
    passport.use(
        'kakao-login',
        new KakaoStrategy({
        clientID: process.env.KAKAO_ID,
        callbackURL: '/auth/kakao/signin/callback',
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const exUser = await models.User.findOne({where : { snsId : profile.id, provider : 'kakao' }});
            if (exUser) {
                done(null, exUser);
            } else {
                const newUser = await models.User.create({
                    email : profile._json.kakao_account.email,
                    password : profile.id,
                    name : profile._json.properties.nickname,
                    snsId : profile.id,
                    provider : 'kakao'
                });
                done(null, newUser);
            }
        } catch (error) {
            console.log(error);
            done(error);
        }
    }));
};