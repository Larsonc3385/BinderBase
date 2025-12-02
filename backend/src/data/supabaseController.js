import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Read environment variables
dotenv.config();
const SUPABASE_URL = process.env.SUPABSEURL ?? 'http://localhost:3000';
const SUPABASE_PUB_KEY = process.env.SUPABASE_PUB_KEY ?? 'badKey';

// Make DB Client Object
export const DBClient = createClient(SUPABASE_URL, SUPABASE_PUB_KEY);

//Maximum number of results allowed to return
const MIN_RESULTS = 1;
const MAX_RESULTS = 100;


