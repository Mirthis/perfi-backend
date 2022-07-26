import express from 'express';
import passport from 'passport';
import crypto from 'crypto';
import {
  RESET_PASSWORD_TOKEN_DURATION_DAYS,
  VERIFY_EMAIL_TOKEN_DURATION_DAYS,
} from '../config/appConfig';
import { User } from '../models';
import AuthToken from '../models/authToken';
import { AuthErrorName, AuthTokenType } from '../types/types';
import emailTransporter from '../config/devEmail';
import getEmailVerificationData from '../emails/emailVerifcation';
import { parseString } from '../utils/requestParamParser';
import getResetPasswordData from '../emails/resetPassword';
import { AuthError } from '../types/errors';
import { isAuthenticated } from '../utils/middleware';
// import { AuthError, AuthErrorType } from '../types/errors';
// import { isUser } from '../utils/middleware';

const router = express.Router();

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
const sendVerifyEmail = async (user: Express.User | User, hostName: string) => {
  const expireAt = new Date();
  expireAt.setDate(expireAt.getDate() + VERIFY_EMAIL_TOKEN_DURATION_DAYS);
  const token = crypto.randomBytes(32).toString('hex');
  await AuthToken.destroy({
    where: { userId: user.id, type: AuthTokenType.VERIFY_EMAIL },
  });
  const authToken = await AuthToken.create({
    token,
    userId: user.id,
    type: AuthTokenType.VERIFY_EMAIL,
    expireAt,
  });

  const message = getEmailVerificationData(hostName, user.email, token);
  emailTransporter.sendMail(message);
  return authToken;
};

// TODO: Add logic to avoid multiple request in short time
const sendResetPassword = async (
  user: Express.User | User,
  hostName: string,
) => {
  const expireAt = new Date();
  expireAt.setDate(expireAt.getDate() + RESET_PASSWORD_TOKEN_DURATION_DAYS);
  const token = crypto.randomBytes(32).toString('hex');
  await AuthToken.destroy({
    where: { userId: user.id, type: AuthTokenType.RESET_PASSWORD },
  });
  const authToken = await AuthToken.create({
    token,
    userId: user.id,
    type: AuthTokenType.RESET_PASSWORD,
    expireAt,
  });

  const message = getResetPasswordData(hostName, user.email, token);
  emailTransporter.sendMail(message);
  return authToken;
};

router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: true }, (err, user) => {
    if (err) {
      throw Error(err);
    }
    if (user) {
      if (!user.isVerified) {
        next(
          new AuthError(
            'User is not verified',
            AuthErrorName.USER_NOT_VERIFIED,
          ),
        );
        // res.status(401).json({ fuck: 'shit' });
        // throw new AuthError(
        //   'User is not verified',
        //   AuthErrorName.USER_NOT_VERIFIED,
        // );
      } else {
        req.logIn(user, (loginErr) => {
          if (loginErr) {
            return next(loginErr);
          }
          return res.status(200).json({ id: user.id, email: user.email });
        });
      }
    } else {
      // res.json(info.message);
      next(
        new AuthError(
          'Invalid username of password',
          AuthErrorName.USER_CREDENTIALS_NOT_FOUND,
        ),
      );
    }
  })(req, res, next);
});

router.get('/login', isAuthenticated, (req, res) => {
  console.log('Checking login');
  res.status(200).json(req.user!);
});

router.post('/signup', async (req, res) => {
  console.log(req.body);
  const user = await User.create(req.body);
  await sendVerifyEmail(user, req.headers.host!.split(':')[0]);

  res.json({ id: user.id, email: user.email });
});

router.post('/verify_email', async (req, res) => {
  console.log('Verify email body');
  console.log(req.body);
  const email = parseString(req.body.email, 'email');
  console.log('email');
  console.log(email);
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new AuthError('User not found', AuthErrorName.USER_EMAIL_NOT_FOUND);
  } else if (!user.isActive) {
    throw new AuthError('User is not active', AuthErrorName.USER_INACTIVE);
  } else if (user.isVerified) {
    throw new AuthError(
      'User is already verified',
      AuthErrorName.USER_ALREADY_VERIFIED,
    );
  }
  await sendVerifyEmail(user, req.headers.host!.split(':')[0]);
  res.json(200);
});

router.put('/verify_email', async (req, res) => {
  const tokenParam = parseString(req.body.token, 'token');
  const token = await AuthToken.findOne({
    where: { token: tokenParam, type: AuthTokenType.VERIFY_EMAIL },
  });
  console.log('token');
  console.log(token);
  if (!token) {
    throw new AuthError(
      'Verify email token not found',
      AuthErrorName.VERIFY_EMAIL_TOKEN_NOT_FOUND,
    );
  }
  if (token.expireAt < new Date()) {
    throw new AuthError(
      'Verify email token expired',
      AuthErrorName.VERIFY_EMAIL_TOKEN_EXPIRED,
    );
  }
  const user = await User.findByPk(token.userId);
  console.log('user');
  console.log(user);
  if (!user) {
    throw new AuthError('User not found', AuthErrorName.USER_EMAIL_NOT_FOUND);
  }
  user.isVerified = true;
  await user.save();
  await token.destroy();
  return res.json(user);
});

router.post('/reset_password', async (req, res) => {
  const email = parseString(req.body.email, 'Email');
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new AuthError('User not found', AuthErrorName.USER_EMAIL_NOT_FOUND);
  } else if (!user.isVerified) {
    throw new AuthError('User not verified', AuthErrorName.USER_NOT_VERIFIED);
  } else {
    await sendResetPassword(user, req.headers.host!.split(':')[0]);
    res.json(200);
  }
});

router.put('/reset_password', async (req, res) => {
  const tokenParam = parseString(req.body.token, 'token');
  const password = parseString(req.body.password, 'password');
  const token = await AuthToken.findOne({
    where: { token: tokenParam, type: AuthTokenType.RESET_PASSWORD },
  });
  console.log('token');
  console.log(token);
  if (!token) {
    throw new AuthError(
      'User not found',
      AuthErrorName.VERIFY_PASSWORD_TOKEN_NOT_FOUND,
    );
  }
  if (token.expireAt < new Date()) {
    throw new AuthError(
      'User not found',
      AuthErrorName.VERIFY_PASSWORD_TOKEN_EXPIRED,
    );
  }
  const user = await User.findByPk(token.userId);
  console.log('user');
  console.log(user);
  if (!user) {
    throw new AuthError('User not found', AuthErrorName.USER_EMAIL_NOT_FOUND);
  }
  user.password = password;
  await user.save();
  await token.destroy();
  return res.json(user);
});

export default router;
