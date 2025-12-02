import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Read environment variables
dotenv.config();

// Fix: Was SUPABSEURL (typo), should be SUPABASE_URL
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.SUPABASEURL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_PUB_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERROR: Missing Supabase credentials!');
  console.error('SUPABASE_URL:', SUPABASE_URL ? 'Set' : 'Missing');
  console.error('SUPABASE_KEY:', SUPABASE_KEY ? 'Set' : 'Missing');
  console.error('\nPlease check your .env file has:');
  console.error('SUPABASE_URL=your_project_url');
  console.error('SUPABASE_KEY=your_anon_key');
  process.exit(1);
}

console.log('Connecting to Supabase...');
console.log('URL:', SUPABASE_URL);

// Make DB Client Object
export const DBClient = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('Supabase client initialized successfully');

// Maximum number of results allowed to return
export const MIN_RESULTS = 1;
export const MAX_RESULTS = 100;