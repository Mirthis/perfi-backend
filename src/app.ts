import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import middleware from './utils/middleware';
import { sequelize } from './utils/db';
import { User } from './models';
import config from './utils/config';
import { localStrategy } from './utils/auth';
import {
  usersRouter,
  authRouter,
  transactionsRouter,
  plaidRouter,
  accountsRouter,
} from './controllers';

// const LocalStrategy = require('passport-local').Strategy;

const SequelizeStore = require('connect-session-sequelize')(session.Store);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TODO: tweak settings
const sessStore = new SequelizeStore({ db: sequelize, tableName: 'sessions' });
const sess = {
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
  name: 'perfi.sid',
  store: sessStore,
};

if (config.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  // TODO: check how to enable HTTPS
  sess.cookie.secure = true; // serve secure cookies
}

app.use(session(sess));

app.use(passport.initialize());
app.use(passport.session());

passport.use(localStrategy);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (userId: number, done) => {
  try {
    const user = await User.findByPk(userId);
    // @ts-ignore
    // TODO: Fix TS compile issue
    done(null, user.toJSON());
  } catch (err) {
    done(err, null);
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.use(
    middleware.morgan(
      ':method :url :status :res[content-length] - :response-time ms :body',
    ),
  );
}

app.use('/api/users', usersRouter);
app.use('/api/plaid', plaidRouter);
app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/accounts', accountsRouter);

app.use(middleware.errorHandler);
app.use(middleware.unknownEndpoint);

export default app;
