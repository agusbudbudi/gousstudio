import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    {
      name: 'portfolio-save-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/api/save-portfolio' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const { data, password } = JSON.parse(body);
                const env = fs.readFileSync(resolve(__dirname, '.env'), 'utf-8')
                  .split('\n')
                  .filter(l => l && l.includes('=') && !l.startsWith('#'))
                  .reduce((acc: any, l) => {
                    const index = l.indexOf('=');
                    const k = l.substring(0, index).trim();
                    const v = l.substring(index + 1).trim().replace(/^"|"$/g, '');
                    acc[k] = v;
                    return acc;
                  }, {});

                const effectiveUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
                const effectiveKey = env.SUPABASE_SERVICE_ROLE_KEY;
                const effectivePassword = env.CMS_PASSWORD || env.VITE_CMS_PASSWORD;

                if (password !== effectivePassword) {
                  res.statusCode = 401;
                  return res.end(JSON.stringify({ message: 'Unauthorized' }));
                }

                const { createClient } = await import('@supabase/supabase-js');
                const supabase = createClient(effectiveUrl, effectiveKey);

                const flatData = Object.entries(data).flatMap(([category, items]: [string, any]) => 
                  items.map((item: any, index: number) => ({ 
                    title: item.title,
                    description: item.description,
                    category: category,
                    tags: item.tags || [],
                    imgalt: item.imgalt || item.imgAlt || '',
                    linkurl: item.linkurl || item.linkUrl || '',
                    image: item.image,
                    role: item.role,
                    tools: item.tools || [],
                    order_index: index,
                    pricelist_id: (item.pricelist_id && String(item.pricelist_id).trim() !== "" && String(item.pricelist_id) !== "null") ? parseInt(item.pricelist_id, 10) : null
                  }))
                );

                const { error: delError } = await supabase.from('portfolios').delete().not('id', 'is', null);
                if (delError) throw delError;

                if (flatData.length > 0) {
                  const { error: insError } = await supabase.from('portfolios').insert(flatData);
                  if (insError) throw insError;
                }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (err: any) {
                console.error('Local API Error:', err);
                res.statusCode = 500;
                res.end(JSON.stringify({ message: err.message }));
              }
            });
            return;
          }

          if (req.url === '/api/save-order' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const { orderData } = JSON.parse(body);
                const env = fs.readFileSync(resolve(__dirname, '.env'), 'utf-8')
                  .split('\n')
                  .filter(l => l && l.includes('=') && !l.startsWith('#'))
                  .reduce((acc: any, l) => {
                    const index = l.indexOf('=');
                    const k = l.substring(0, index).trim();
                    const v = l.substring(index + 1).trim().replace(/^"|"$/g, '');
                    acc[k] = v;
                    return acc;
                  }, {});

                const effectiveUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
                const effectiveKey = env.SUPABASE_SERVICE_ROLE_KEY;

                if (!effectiveUrl || !effectiveKey) {
                  res.statusCode = 500;
                  return res.end(JSON.stringify({ message: 'Server configuration missing' }));
                }

                const { createClient } = await import('@supabase/supabase-js');
                const supabase = createClient(effectiveUrl, effectiveKey);

                // Generate order number
                const now = new Date();
                const dateStr = now.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
                const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, ''); // HHMMSS
                const randomStr = Math.random().toString(36).substring(2, 5); // 3 random chars
                const orderNumber = `GS-${dateStr}${randomStr}`;

                // Prepare order data
                if (!orderData.selected_package) {
                  res.statusCode = 400;
                  return res.end(JSON.stringify({ message: "Missing selected_package" }));
                }

                // Fetch price details from pricelists so `orders` is fully populated
                // when admin opens it in CMS.
                const { data: priceRow, error: priceError } = await supabase
                  .from("pricelists")
                  .select("*")
                  .eq("servicename", orderData.selected_package)
                  .single();

                if (priceError || !priceRow) {
                  res.statusCode = 400;
                  return res.end(
                    JSON.stringify({
                      message: "Selected package not found in pricelists",
                      error: priceError?.message,
                    }),
                  );
                }

                const orderPayload = {
                  order_number: orderNumber,
                  full_name: orderData.name,
                  phone_number: orderData.whatsapp,
                  design_category: orderData.design_category || priceRow.category,
                  selected_package: orderData.selected_package,
                  brief_detail: orderData.brief,
                  deadline: orderData.deadline,
                  price: priceRow.finalprice ?? 0,
                  discount_value: 0,
                  discount_type: "fixed",
                  final_price: priceRow.finalprice ?? 0,
                  source_order: 'web',
                  status: 'DRAFT'
                };

                // Insert order
                const { data, error } = await supabase
                  .from('orders')
                  .insert(orderPayload)
                  .select()
                  .single();

                if (error) {
                  console.error('Error inserting order:', error);
                  res.statusCode = 500;
                  return res.end(JSON.stringify({ message: 'Failed to create order', error: error.message }));
                }

                console.log('Order created successfully:', data);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  message: 'Order created successfully',
                  order: data
                }));
              } catch (err: any) {
                console.error('Local API Error:', err);
                res.statusCode = 500;
                res.end(JSON.stringify({ message: err.message }));
              }
            });
            return;
          }

          next();
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react') || id.includes('framer-motion')) {
              return 'vendor-ui';
            }
            return 'vendor';
          }
        }
      }
    },
    // Use default minifier for better compatibility with Vite 8
    target: 'esnext',
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
  },
})
