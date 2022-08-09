"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const crypto_1 = __importDefault(require("crypto"));
const appConfig_1 = require("../config/appConfig");
const models_1 = require("../models");
const authToken_1 = __importDefault(require("../models/authToken"));
const types_1 = require("../types/types");
const devEmail_1 = __importDefault(require("../config/devEmail"));
const emailVerifcation_1 = __importDefault(require("../emails/emailVerifcation"));
const requestParamParser_1 = require("../utils/requestParamParser");
const resetPassword_1 = __importDefault(require("../emails/resetPassword"));
const errors_1 = require("../types/errors");
const middleware_1 = require("../utils/middleware");
// import { AuthError, AuthErrorType } from '../types/errors';
// import { isUser } from '../utils/middleware';
const router = express_1.default.Router();
router.post('/logout', (req, res) => {
    req.logout();
    req.session.destroy((err) => console.error(err));
    // res.status(200).clearCookie('perfi.sid', {
    //   path: '/',
    //   secure: false,
    //   httpOnly: true,
    //   domain: 'localhost',
    // });
    res.status(200);
});
// TODO: Add logic to avoid multiple request in short time
const sendVerifyEmail = async (user, hostName) => {
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + appConfig_1.VERIFY_EMAIL_TOKEN_DURATION_DAYS);
    const token = crypto_1.default.randomBytes(32).toString('hex');
    await authToken_1.default.destroy({
        where: { userId: user.id, type: types_1.AuthTokenType.VERIFY_EMAIL },
    });
    const authToken = await authToken_1.default.create({
        token,
        userId: user.id,
        type: types_1.AuthTokenType.VERIFY_EMAIL,
        expireAt,
    });
    const message = (0, emailVerifcation_1.default)(hostName, user.email, token);
    devEmail_1.default.sendMail(message);
    return authToken;
};
// TODO: Add logic to avoid multiple request in short time
const sendResetPassword = async (user, hostName) => {
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + appConfig_1.RESET_PASSWORD_TOKEN_DURATION_DAYS);
    const token = crypto_1.default.randomBytes(32).toString('hex');
    await authToken_1.default.destroy({
        where: { userId: user.id, type: types_1.AuthTokenType.RESET_PASSWORD },
    });
    const authToken = await authToken_1.default.create({
        token,
        userId: user.id,
        type: types_1.AuthTokenType.RESET_PASSWORD,
        expireAt,
    });
    const message = (0, resetPassword_1.default)(hostName, user.email, token);
    devEmail_1.default.sendMail(message);
    return authToken;
};
router.post('/login', (req, res, next) => {
    passport_1.default.authenticate('local', { session: true }, (err, user) => {
        if (err) {
            throw Error(err);
        }
        if (user) {
            if (!user.isVerified) {
                next(new errors_1.AuthError('User is not verified', types_1.AuthErrorName.USER_NOT_VERIFIED));
                // res.status(401).json({ fuck: 'shit' });
                // throw new AuthError(
                //   'User is not verified',
                //   AuthErrorName.USER_NOT_VERIFIED,
                // );
            }
            else {
                req.logIn(user, (loginErr) => {
                    if (loginErr) {
                        return next(loginErr);
                    }
                    return res.status(200).json({ id: user.id, email: user.email });
                });
            }
        }
        else {
            // res.json(info.message);
            next(new errors_1.AuthError('Invalid username of password', types_1.AuthErrorName.USER_CREDENTIALS_NOT_FOUND));
        }
    })(req, res, next);
});
router.get('/login', middleware_1.isAuthenticated, (req, res) => {
    res.status(200).json(req.user);
});
router.post('/signup', async (req, res) => {
    const user = await models_1.User.create(req.body);
    await sendVerifyEmail(user, req.headers.host.split(':')[0]);
    res.json({ id: user.id, email: user.email });
});
router.post('/verify-email', async (req, res) => {
    const email = (0, requestParamParser_1.parseString)(req.body.email, 'email');
    const user = await models_1.User.findOne({ where: { email } });
    if (!user) {
        throw new errors_1.AuthError('User not found', types_1.AuthErrorName.USER_EMAIL_NOT_FOUND);
    }
    else if (!user.isActive) {
        throw new errors_1.AuthError('User is not active', types_1.AuthErrorName.USER_INACTIVE);
    }
    else if (user.isVerified) {
        throw new errors_1.AuthError('User is already verified', types_1.AuthErrorName.USER_ALREADY_VERIFIED);
    }
    await sendVerifyEmail(user, req.headers.host.split(':')[0]);
    res.json(200);
});
router.put('/verify-email', async (req, res) => {
    const tokenParam = (0, requestParamParser_1.parseString)(req.body.token, 'token');
    const token = await authToken_1.default.findOne({
        where: { token: tokenParam, type: types_1.AuthTokenType.VERIFY_EMAIL },
    });
    if (!token) {
        throw new errors_1.AuthError('Verify email token not found', types_1.AuthErrorName.VERIFY_EMAIL_TOKEN_NOT_FOUND);
    }
    if (token.expireAt < new Date()) {
        throw new errors_1.AuthError('Verify email token expired', types_1.AuthErrorName.VERIFY_EMAIL_TOKEN_EXPIRED);
    }
    const user = await models_1.User.findByPk(token.userId);
    if (!user) {
        throw new errors_1.AuthError('User not found', types_1.AuthErrorName.USER_EMAIL_NOT_FOUND);
    }
    user.isVerified = true;
    await user.save();
    await token.destroy();
    return res.json(user);
});
router.post('/reset-password', async (req, res) => {
    const email = (0, requestParamParser_1.parseString)(req.body.email, 'Email');
    const user = await models_1.User.findOne({ where: { email } });
    if (!user) {
        throw new errors_1.AuthError('User not found', types_1.AuthErrorName.USER_EMAIL_NOT_FOUND);
    }
    else if (!user.isVerified) {
        throw new errors_1.AuthError('User not verified', types_1.AuthErrorName.USER_NOT_VERIFIED);
    }
    else {
        await sendResetPassword(user, req.headers.host.split(':')[0]);
        res.json(200);
    }
});
router.put('/reset-password', async (req, res) => {
    const tokenParam = (0, requestParamParser_1.parseString)(req.body.token, 'token');
    const password = (0, requestParamParser_1.parseString)(req.body.password, 'password');
    const token = await authToken_1.default.findOne({
        where: { token: tokenParam, type: types_1.AuthTokenType.RESET_PASSWORD },
    });
    if (!token) {
        throw new errors_1.AuthError('User not found', types_1.AuthErrorName.VERIFY_PASSWORD_TOKEN_NOT_FOUND);
    }
    if (token.expireAt < new Date()) {
        throw new errors_1.AuthError('User not found', types_1.AuthErrorName.VERIFY_PASSWORD_TOKEN_EXPIRED);
    }
    const user = await models_1.User.findByPk(token.userId);
    if (!user) {
        throw new errors_1.AuthError('User not found', types_1.AuthErrorName.USER_EMAIL_NOT_FOUND);
    }
    user.password = password;
    await user.save();
    await token.destroy();
    return res.json(user);
});
exports.default = router;
