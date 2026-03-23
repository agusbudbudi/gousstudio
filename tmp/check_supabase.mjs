import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env');
const env = fs.readFileSync(envPath, 'utf-8')
  .split('\n')
  .filter(l => l && l.includes('=') && !l.startsWith('#'))
  .reduce((acc, l) => {
    const index = l.indexOf('=');
    const k = l.substring(0, index).trim();
    const v = l.substring(index + 1).trim().replace(/^"|"$/g, '');
    acc[k] = v;
    return acc;
  }, {});

const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('--- Checking Orders Table Columns ---');
  // We can't easily list columns via API without RPC, but we can try to select one row and see the keys
  const { data: order, error: orderError } = await supabase.from('orders').select('*').limit(1).single();
  if (orderError && orderError.code !== 'PGRST116') {
     console.error('Error fetching order:', orderError);
  } else if (order) {
    console.log('Columns found in orders table:', Object.keys(order));
  } else {
    console.log('No orders found to check columns.');
  }

  console.log('\n--- Checking Storage Buckets ---');
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    console.error('Error fetching buckets:', bucketError);
  } else {
    console.log('Available buckets:', buckets.map(b => b.name));
  }
}

checkSchema();
