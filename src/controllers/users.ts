/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';
import { User } from '../models';

const router = express.Router();

router.get('/', async (_req, res) => {
  const users = await User.findAll();
  res.json(users);
});

router.post('/', async (req, res) => {
  console.log(req.body);
  const user = await User.create(req.body);
  res.json({ id: user.id, email: user.email });
});

export default router;
