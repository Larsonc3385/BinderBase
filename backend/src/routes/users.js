import Express from 'express';
import {DBClient, keepDBOnline, createUser} from '../data/supabaseController.js';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

dotenv.config();

const router = new Express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const { data: user, error } = await DBClient
      .from('User')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user)
      return res.status(401).json({ valid: false, message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ valid: false, message: 'Invalid password' });

    res.json({ valid: true, user: { id: user.id, username: user.username} });

  } catch (err) {
    console.error(err);
    res.status(500).json({ valid: false, message: 'Internal server error' });
  }
});

// SIGNUP -------------------------------------------------
router.post('/create', async (req, res) => {
  const { username, password } = req.body;

  if (!password || !username)
    return res.status(400).json({ error: true, message: 'Missing required fields' });

  try {
    await createUser(username, password);
    res.json({ success: true, message: 'Account created. Check your email to verify.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: 'Signup failed' });
  }
});



export default router;