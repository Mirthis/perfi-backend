import { Request, Response, NextFunction } from 'express';
import { Strategy as LocalStrategy } from 'passport-local';
import { User } from '../models';

// eslint-disable-next-line import/prefer-default-export
export const localStrategy = new LocalStrategy(
  {
    usernameField: 'email',
  },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return done(null, false, { message: 'Invalid username or password' });
      }
      const verified = await user.verifyPassword(password);
      if (!verified) {
        return done(null, false, { message: 'Invalid username or password' });
      }
      return done(null, user.toJSON());
    } catch (err) {
      return done(err);
    }
  },
);

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).send('not authenticated');
};
