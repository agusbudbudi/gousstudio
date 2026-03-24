const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function cleanDuplicateUrls() {
  console.log('🔍 Checking for duplicate Link Gallery / Drive URLs...');

  try {
    // Get all portfolio items with their linkurl
    const { data: portfolios, error: fetchError } = await supabase
      .from('portfolios')
      .select('id, title, linkurl, category')
      .order('order_index', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching portfolios:', fetchError);
      return;
    }

    console.log(`📊 Found ${portfolios.length} total portfolio items`);

    // Group by linkurl (only non-null/empty URLs)
    const urlGroups = {};
    const nullUrls = [];

    portfolios.forEach(item => {
      const url = item.linkurl?.trim();
      if (!url) {
        nullUrls.push(item);
      } else {
        if (!urlGroups[url]) {
          urlGroups[url] = [];
        }
        urlGroups[url].push(item);
      }
    });

    console.log(`🔗 Found ${Object.keys(urlGroups).length} unique URLs`);
    console.log(`📭 Found ${nullUrls.length} items with no URL`);

    // Find URLs that appear multiple times
    const duplicateUrls = Object.keys(urlGroups).filter(url => urlGroups[url].length > 1);

    if (duplicateUrls.length === 0) {
      console.log('✅ No duplicate URLs found! All URLs are unique.');
      return;
    }

    console.log(`🚨 Found ${duplicateUrls.length} URLs that appear multiple times:`);

    let totalToDelete = 0;

    for (const url of duplicateUrls) {
      const items = urlGroups[url];
      console.log(`\n📋 URL: ${url}`);
      console.log(`   Appears in ${items.length} items:`);

      items.forEach((item, index) => {
        const marker = index === 0 ? '✅ KEEP' : '🗑️  DELETE';
        console.log(`   ${marker} - ID: ${item.id}, Title: "${item.title}", Category: ${item.category}`);
      });

      // Keep the first item, delete the rest
      const itemsToDelete = items.slice(1);
      totalToDelete += itemsToDelete.length;

      for (const itemToDelete of itemsToDelete) {
        console.log(`   Deleting item ID: ${itemToDelete.id}...`);

        const { error: deleteError } = await supabase
          .from('portfolios')
          .delete()
          .eq('id', itemToDelete.id);

        if (deleteError) {
          console.error(`   ❌ Error deleting item ${itemToDelete.id}:`, deleteError);
        } else {
          console.log(`   ✅ Successfully deleted item ${itemToDelete.id}`);
        }
      }
    }

    console.log(`\n🎉 Cleanup completed!`);
    console.log(`📊 Deleted ${totalToDelete} duplicate items`);
    console.log(`✨ All remaining items now have unique URLs`);

    // Verify the cleanup
    console.log('\n🔍 Verifying cleanup...');
    const { data: remainingPortfolios, error: verifyError } = await supabase
      .from('portfolios')
      .select('id, title, linkurl')
      .not('linkurl', 'is', null)
      .neq('linkurl', '');

    if (verifyError) {
      console.error('❌ Error verifying cleanup:', verifyError);
      return;
    }

    const remainingUrls = remainingPortfolios.map(item => item.linkurl?.trim()).filter(url => url);
    const uniqueRemainingUrls = new Set(remainingUrls);

    console.log(`📊 Remaining items with URLs: ${remainingPortfolios.length}`);
    console.log(`🔗 Unique URLs remaining: ${uniqueRemainingUrls.size}`);

    if (remainingUrls.length === uniqueRemainingUrls.size) {
      console.log('✅ Verification successful: All URLs are now unique!');
    } else {
      console.log('⚠️  Warning: Some URLs may still be duplicated. Please check manually.');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the cleanup
cleanDuplicateUrls();