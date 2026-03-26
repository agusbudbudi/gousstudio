import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Rate limiter
const ipRequests = new Map();
function isRateLimited(ip) {
  const windowMs = 60 * 1000;
  const maxRequests = 5;
  const now = Date.now();
  if (!ipRequests.has(ip)) ipRequests.set(ip, []);
  const requests = ipRequests.get(ip).filter(t => now - t < windowMs);
  requests.push(now);
  ipRequests.set(ip, requests);
  return requests.length > maxRequests;
}

export default async function handler(req, res) {
  const { action } = req.query;
  const { SUPABASE_URL, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_ANON_KEY } = process.env;
  const effectiveUrl = SUPABASE_URL || VITE_SUPABASE_URL;

  if (!effectiveUrl || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ message: 'Server configuration missing' });
  }

  const supabase = createClient(effectiveUrl, SUPABASE_SERVICE_ROLE_KEY);

  switch (action) {
    case 'create': // was save-order.js
      if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
      const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
      if (isRateLimited(ip)) return res.status(429).json({ message: 'Too many requests' });
      
      try {
        const { orderData } = req.body;
        const now = new Date();
        const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
        const orderNumber = `GS-${dateStr}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        
        const { data: priceRow } = await supabase.from('pricelists').select('*').eq('servicename', orderData.selected_package).single();
        if (!priceRow) return res.status(400).json({ message: 'Package not found' });

        const payload = {
          order_number: orderNumber,
          full_name: orderData.name,
          phone_number: orderData.whatsapp,
          design_category: orderData.design_category || priceRow.category,
          selected_package: orderData.selected_package,
          brief_detail: orderData.brief,
          deadline: orderData.deadline,
          price: priceRow.finalprice ?? 0,
          final_price: priceRow.finalprice ?? 0,
          source_order: 'web',
          status: 'DRAFT'
        };

        const { data, error } = await supabase.from('orders').insert(payload).select().single();
        if (error) throw error;
        return res.status(200).json({ message: 'Success', order: data });
      } catch (e) { return res.status(500).json({ message: e.message }); }

    case 'get': // was get-order.js
      if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
      try {
        const { orderNumber } = req.query;
        const { data: order, error } = await supabase.from('orders').select('*').eq('order_number', orderNumber).single();
        if (error || !order) return res.status(404).json({ message: 'Not found' });

        let priceData = order.package_details || null;
        if (!priceData && order.selected_package) {
          const { data } = await supabase.from('pricelists').select('*').eq('servicename', order.selected_package).single();
          priceData = data;
        }
        return res.status(200).json({ success: true, order, priceData });
      } catch (e) { return res.status(500).json({ message: e.message }); }

    case 'status': // was transaction-status.js
      if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
      try {
        const { order_id } = req.query;
        const { data: order, error } = await supabase.from('orders').select('status, paid_at').eq('order_number', order_id).single();
        if (error || !order) return res.status(404).json({ message: 'Not found' });
        const isPaid = order.status === "IN PROGRESS" || order.status === "SUCCESS" || !!order.paid_at;
        return res.status(200).json({ status: isPaid ? "completed" : "pending", orderStatus: order.status });
      } catch (e) { return res.status(500).json({ message: e.message }); }

    case 'update-proof':
      if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
      try {
        const { orderNumber, paymentProofUrl } = req.body;
        if (!orderNumber || !paymentProofUrl) {
          return res.status(400).json({ message: 'Order number and proof URL are required' });
        }
        const { data, error } = await supabase
          .from('orders')
          .update({ payment_proof_url: paymentProofUrl })
          .eq('order_number', orderNumber)
          .select()
          .single();
        if (error) throw error;
        return res.status(200).json({ success: true, order: data });
      } catch (e) { return res.status(500).json({ message: e.message }); }

    default:
      return res.status(400).json({ message: 'Invalid action' });
  }
}
