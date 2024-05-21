import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';

const initializePassport = (passport) => {
    var userProfile;

    passport.serializeUser(function (user, cb) {
        cb(null, user);
    });

    passport.deserializeUser(function (obj, cb) {
        cb(null, obj);
    });

    const GOOGLE_CLIENT_ID = '405512277507-9kptnns7qoq4viusq6nsr44bk2q6t297.apps.googleusercontent.com';
    const GOOGLE_CLIENT_SECRET = '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';

    passport.use(new GoogleStrategy({
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: "https://bd96-66-81-175-61.ngrok-free.app/auth/google/callback"
        },
        function (accessToken, refreshToken, profile, done) {
            userProfile = profile;
            return done(null, userProfile);
        }
    ));
};

export default initializePassport;
