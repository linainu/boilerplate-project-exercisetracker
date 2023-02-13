import express from 'express';
import { __dirname } from '../consts.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

export default router;