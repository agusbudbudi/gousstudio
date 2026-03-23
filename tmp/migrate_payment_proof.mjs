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

async function migrate() {
  console.log('--- Migrating Database ---');
  // Add payment_proof_url column
  const { error: alterError } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;'
  });

  if (alterError) {
    if (alterError.message.includes('permission denied') || alterError.message.includes('function rpc.exec_sql() does not exist')) {
        console.warn('RPC exec_sql not available. Please add the column manually in Supabase SQL Editor:');
        console.log('ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;');
    } else {
        console.error('Error adding column:', alterError);
    }
  } else {
    console.log('Column payment_proof_url added successfully (or already exists).');
  }

  console.log('\n--- Creating Storage Bucket ---');
  const { data: bucket, error: bucketError } = await supabase.storage.createBucket('payment-proofs', {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']
  });

  if (bucketError) {
    if (bucketError.message.includes('already exists')) {
      console.log('Bucket "payment-proofs" already exists.');
    } else {
      console.error('Error creating bucket:', bucketError);
    }
  } else {
    console.log('Bucket "payment-proofs" created successfully.');
  }
}

migrate();
