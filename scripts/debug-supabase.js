const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', supabaseUrl);
console.log('Key (prefix):', supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'MISSING');

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
  console.log('\n🔍 Checking connection...');
  
  // Try to fetch a non-existent table to see the error type
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .limit(1);

  if (error) {
    console.log('❌ Error fetching portfolios:', error.message);
    console.log('Full error:', JSON.stringify(error, null, 2));
  } else {
    console.log('✅ Successfully reached portfolios table!');
  }

  // Try to list tables via a RPC or other means? 
  // Supabase doesn't have a direct "list tables" method in the JS client easily,
  // but we can try to query pg_catalog if we have enough permissions.
  
  const { data: tables, error: tableError } = await supabase.rpc('get_tables_info'); 
  // Probably won't work without the RPC defined.

  console.log('\n--- Troubleshooting Tips ---');
  console.log('1. Pastikan SQL Editor di Supabase sudah menunjukkan "Success".');
  console.log('2. Buka "Table Editor" di Supabase Dashboard. Apakah tabel "portfolios" ada di sana?');
  console.log('3. Pastikan URL dan Key di .env sudah benar-benar sesuai dengan proyek tersebut.');
}

debug();
