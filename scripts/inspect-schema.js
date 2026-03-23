const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  console.log('🔍 Inspecting Supabase Schema...');

  const tables = ['portfolios', 'pricelists', 'services', 'fastwork_items'];

  for (const table of tables) {
    console.log(`\n--- Table: ${table} ---`);
    // Try to get column info via a dummy select
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.error(`Error reading ${table}:`, error.message);
    } else {
      // If table is empty, we can't get keys this way. 
      // We'll try to just check if the table exists by inserting a null value if allowed? No.
      console.log(`✅ Table exists.`);
      if (data.length > 0) {
        console.log(`Columns found:`, Object.keys(data[0]));
      } else {
        console.log(`ℹ️ Table is empty. Cannot determine columns via SELECT *. Trying to fetch first row...`);
      }
    }
  }
}

inspectSchema();
