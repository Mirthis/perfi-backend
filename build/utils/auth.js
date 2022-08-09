"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = exports.localStrategy = void 0;
const passport_local_1 = require("passport-local");
const models_1 = require("../models");
// eslint-disable-next-line import/prefer-default-export
exports.localStrategy = new passport_local_1.Strategy({
    usernameField: 'email',
}, async (email, password, done) => {
    try {
        const user = await models_1.User.findOne({ where: { email } });
        if (!user) {
            return done(null, false, { message: 'Invalid username or password' });
        }
        const verified = await user.verifyPassword(password);
        if (!verified) {
            return done(null, false, { message: 'Invalid username or password' });
        }
        return done(null, user.toJSON());
    }
    catch (err) {
        return done(err);
    }
});
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated())
        return next();
    return res.status(401).send('not authenticated');
};
exports.isAuthenticated = isAuthenticated;
