import express from 'express';
import passport from 'passport';

const router = express.Router();

router.post('/logout', (req, res) => {
  req.logout();
  res.status(200);
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: true }, (err, user, info) => {
    console.log(err);
    console.log(user);
    console.log(info);
    if (err) {
      throw Error(err);
    }
    if (user) {
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        return res.status(200).json({ id: user.id, email: user.email });
      });
    }
    if (info?.message) {
      // res.json(info.message);
      res.status(401).json({
        error: info.message,
      });
    }
  })(req, res, next);
});

export default router;
