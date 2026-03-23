const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTables() {
  console.log('🧪 Testing Table Schemas...');

  // 1. Test Pricelists
  console.log('\n--- Testing pricelists ---');
  const { error: pError } = await supabase.from('pricelists').insert({ slug: 'test-slug' });
  if (pError) console.log('❌ Error:', pError.message);
  else console.log('✅ Success: slug column found!');

  // 2. Test Services
  console.log('\n--- Testing services ---');
  const { error: sError } = await supabase.from('services').insert({ slug: 'test-slug' });
  if (sError) console.log('❌ Error:', sError.message);
  else console.log('✅ Success: slug column found!');

  // 3. Test Fastwork
  console.log('\n--- Testing fastwork_items ---');
  const { error: fError } = await supabase.from('fastwork_items').insert({ delay: '0s' });
  if (fError) console.log('❌ Error:', fError.message);
  else console.log('✅ Success: delay column found!');
  
  console.log('\nCleanup: Deleting test rows...');
  await supabase.from('pricelists').delete().eq('slug', 'test-slug');
  await supabase.from('services').delete().eq('slug', 'test-slug');
  await supabase.from('fastwork_items').delete().eq('delay', '0s');
}

testTables();
