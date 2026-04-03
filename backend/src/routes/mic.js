import Express from 'express';
import {DBClient, keepDBOnline} from '../data/supabaseController.js';
import dotenv from 'dotenv';

dotenv.config();

const router = new Express.Router();

router.get('/keepDBOnline', async (req,res)=>{
const isOnline= keepDBOnline();
res.json({ valid: true, isOnline});
})

export default router;