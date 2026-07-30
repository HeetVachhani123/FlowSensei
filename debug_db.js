import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read env file
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

if (!urlMatch || !keyMatch) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Try to fetch boards to see who created them
  const { data: boards, error: boardsError } = await supabase.from('boards').select('*');
  console.log('Boards:', boardsError ? boardsError : boards);
  
  const { data: columns, error: colsError } = await supabase.from('columns').select('*');
  console.log('Columns:', colsError ? colsError : columns);
  
  const { data: members, error: memError } = await supabase.from('board_members').select('*');
  console.log('Members:', memError ? memError : members);
}

run();
