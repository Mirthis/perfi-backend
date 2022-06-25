import express from 'express';
import passport from 'passport';
import { getErrorMessage } from '../utils/logger';
import { isAuthenticated } from '../utils/middleware';

const router = express.Router();

router.post('/login', passport.authenticate('local'), (req, res) => {
  try {
    if (req.user) {
      res.status(200).json({ id: req.user.id, email: req.user.email });
    }
  } catch (err: unknown) {
    console.error(`Error fetching transactions: ${getErrorMessage(err)}`);
  }
});

router.post('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get('/test-auth', isAuthenticated, (_req, res) => {
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
