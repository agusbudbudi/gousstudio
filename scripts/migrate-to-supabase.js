/**
 * Migration Script: migrate-to-supabase.js
 * Run this script to upload local JSON data to Supabase.
 * Usage: node scripts/migrate-to-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('YOUR_SUPABASE')) {
  console.error('Error: Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('🚀 Starting migration...');

  // 1. Migrate Portfolio
  const portfolioPath = path.join(__dirname, '../src/data/portfolio.json');
  if (fs.existsSync(portfolioPath)) {
    console.log('📦 Migrating Portfolios...');
    const portfolioData = JSON.parse(fs.readFileSync(portfolioPath, 'utf8'));
    
    for (const [category, items] of Object.entries(portfolioData)) {
      const formattedItems = items.map(item => ({
        title: item.title || '',
        description: item.description || '',
        category: category,
        tags: item.tags || [],
        imgalt: item.imgAlt || '',
        linkurl: item.linkUrl || '',
        image: item.image || null,
        role: item.role || '',
        tools: item.tools || []
      }));

      const { error } = await supabase.from('portfolios').insert(formattedItems);
      if (error) console.error(`Error inserting portfolio (${category}):`, error.message);
      else console.log(`✅ Migrated ${formattedItems.length} items for ${category}`);
    }
  }

  // 2. Migrate Pricelist
  const pricelistPath = path.join(__dirname, '../src/data/pricelist.json');
  if (fs.existsSync(pricelistPath)) {
    console.log('📦 Migrating Pricelist...');
    const pricelistRaw = JSON.parse(fs.readFileSync(pricelistPath, 'utf8'));
    const pricelistData = pricelistRaw.map(item => ({
      slug: item.id, // Map JSON 'id' to DB 'slug'
      category: item.category,
      servicename: item.serviceName,
      description: item.description,
      retailprice: item.retailPrice,
      finalprice: item.finalPrice,
      duration: item.duration,
      isrevisionunlimited: item.isRevisionUnlimited,
      totalrevision: item.totalRevision,
      deliverables: item.deliverables,
      order_index: item.order_index
    }));

    const { error } = await supabase.from('pricelists').upsert(pricelistData, { onConflict: 'slug' });
    if (error) console.error('Error migrating pricelist:', error.message);
    else console.log(`✅ Migrated ${pricelistData.length} pricelist items`);
  }

  // 3. Migrate Services
  const servicesPath = path.join(__dirname, '../src/data/services.json');
  if (fs.existsSync(servicesPath)) {
    console.log('📦 Migrating Services...');
    const servicesRaw = JSON.parse(fs.readFileSync(servicesPath, 'utf8'));
    const servicesData = servicesRaw.map(item => ({
      slug: item.id, // Map JSON 'id' to DB 'slug'
      title: item.title,
      description: item.description,
      category: item.category,
      icon: item.icon,
      color: item.color,
      included: item.included
    }));
    const { error } = await supabase.from('services').upsert(servicesData, { onConflict: 'slug' });
    if (error) console.error('Error migrating services:', error.message);
    else console.log(`✅ Migrated ${servicesData.length} services`);
  }

  // 4. Migrate Fastwork
  const fastworkPath = path.join(__dirname, '../src/data/fastwork.json');
  if (fs.existsSync(fastworkPath)) {
    console.log('📦 Migrating Fastwork Items...');
    const fastworkData = JSON.parse(fs.readFileSync(fastworkPath, 'utf8'));
    const { error } = await supabase.from('fastwork_items').insert(fastworkData);
    if (error) console.error('Error migrating fastwork:', error.message);
    else console.log(`✅ Migrated ${fastworkData.length} fastwork items`);
  }

  console.log('🏁 Migration complete!');
}

migrate();
