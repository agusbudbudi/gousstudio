import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    // Basic headers for CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    // Manual Env loader helper (same pattern as vite.config.ts)
    const readEnv = () => {
      const env = { ...process.env };
      const envFiles = ['.env', '.env.local'];
      
      for (const file of envFiles) {
        try {
          const filePath = path.resolve(process.cwd(), file);
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            content.split('\n').forEach(line => {
              if (line && line.includes('=') && !line.startsWith('#')) {
                const idx = line.indexOf('=');
                const k = line.substring(0, idx).trim();
                const v = line.substring(idx + 1).trim().replace(/^"|"$/g, '');
                if (!env[k]) env[k] = v; // Only set if not already in process.env
              }
            });
          }
        } catch (e) {
          // Ignore
        }
      }
      return env;
    };

    const env = readEnv();
    const PAKASIR_API_KEY = env.PAKASIR_API_KEY;
    const VITE_PAKASIR_SLUG = env.VITE_PAKASIR_SLUG;

    if (!PAKASIR_API_KEY || !VITE_PAKASIR_SLUG) {
      return res.status(500).json({ 
        message: 'Pakasir configuration missing on server after manual load',
        hasKey: !!PAKASIR_API_KEY,
        hasSlug: !!VITE_PAKASIR_SLUG,
        cwd: process.cwd()
      });
    }

    // Parse body
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (err) {
        return res.status(400).json({ message: 'Invalid JSON body', error: err.message });
      }
    }

    const { order_id } = body || {};

    if (!order_id) {
      return res.status(400).json({ message: 'Missing order_id', received: { order_id } });
    }

    const { VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = env;
    if (!VITE_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ message: 'Supabase configuration missing on server' });
    }

    const supabase = createClient(VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: order, error } = await supabase
      .from('orders')
      .select('price, final_price')
      .eq('order_number', order_id)
      .single();

    if (error || !order) {
      return res.status(404).json({ message: 'Order not found', error: error?.message });
    }

    const secureAmount = order.final_price ?? order.price ?? 0;

    const pakasirUrl = 'https://app.pakasir.com/api/transactioncreate/qris';
    const pakasirPayload = {
      project: VITE_PAKASIR_SLUG,
      order_id: String(order_id),
      amount: Number(secureAmount),
      api_key: PAKASIR_API_KEY
    };

    const response = await fetch(pakasirUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pakasirPayload)
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      return res.status(502).json({ 
        message: 'Pakasir returned non-JSON response', 
        status: response.status,
        text: responseText.slice(0, 500) 
      });
    }

    if (!response.ok || !responseData.payment) {
      return res.status(response.status || 400).json({
        message: responseData.message || 'Failed to create transaction',
        error: responseData
      });
    }

    return res.status(200).json(responseData.payment);

  } catch (error) {
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message,
      stack: error.stack 
    });
  }
}
