/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';
import { User } from '../models';

const router = express.Router();

router.get('/', async (_req, res) => {
  const users = await User.findAll();
  res.json(users);
});

export default router;
