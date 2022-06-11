import express from 'express';
import passport from 'passport';
import { isAuthenticated } from '../utils/middleware';

const router = express.Router();

router.post('/login', passport.authenticate('local'), (req, res) => {
  if (req.user) {
    res.status(200).json({ id: req.user.id, email: req.user.email });
  }
});

router.post('/logout', (req, res, _next) => {
  req.logout();
  res.redirect('/');
});

router.get('/test-auth', isAuthenticated, (_req, res, _next) => {
  res.send('All good');
});

// router.post(
//   '/login',
//   passport.authenticate('local', { failureRedirect: '/login' }),
//   (req, res) => {
//     res.json(req.user);
//     // res.redirect('/');
//   },
// );

// router.post('/login', (req, res, next) => {
//   passport.authenticate('local', (err, user, info) => {
//     console.log(err);
//     console.log(user);
//     console.log(info);
//     if (err) {
//       throw Error(err);
//     }
//     if (user) {
//       res.status(200).json({ id: user.id, email: user.email });
//     }
//     if (info?.message) {
//       // res.json(info.message);
//       res.status(401).json({
//         error: info.message,
//       });
//     }
//   })(req, res, next);
// });

export default router;
