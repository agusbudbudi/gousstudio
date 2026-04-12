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
          status: 'DRAFT',
          voucher_code: orderData.voucher_code || null
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

        // Check for existing referral code
        const { data: referral } = await supabase
          .from('referral_codes')
          .select('code')
          .eq('order_id', order.id)
          .maybeSingle();

        return res.status(200).json({ 
          success: true, 
          order, 
          priceData,
          referralCode: referral?.code || null 
        });
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

    case 'list-referrals':
      try {
        const { data, error } = await supabase
          .from('referral_codes')
          .select('*, orders!order_id(order_number, full_name)')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const usedReferralIds = data.filter(d => d.is_used).map(d => d.id);
          if (usedReferralIds.length > 0) {
            const { data: usedOrders } = await supabase
              .from('orders')
              .select('order_number, referral_id')
              .in('referral_id', usedReferralIds);
            
            if (usedOrders) {
              data.forEach(ref => {
                if (ref.is_used) {
                  const usedBy = usedOrders.find(o => o.referral_id === ref.id);
                  if (usedBy) ref.used_on_order = usedBy.order_number;
                }
              });
            }
          }
        }

        return res.status(200).json({ success: true, data });
      } catch (e) { return res.status(500).json({ message: e.message }); }

    case 'submit-feedback':
      if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
      try {
        const { orderNumber, rating, testimony } = req.body;
        if (!orderNumber || !rating || !testimony) {
          return res.status(400).json({ message: 'Missing required fields' });
        }

        // 1. Get order and client details
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select('*, client_id')
          .eq('order_number', orderNumber)
          .single();

        if (orderError || !order) return res.status(404).json({ message: 'Order not found' });
        if (order.status !== 'DONE') return res.status(400).json({ message: 'Feedback only allowed for completed orders' });

        // 1.5. Prevent Double Claim
        const { data: existingRef } = await supabase
          .from('referral_codes')
          .select('code')
          .eq('order_id', order.id)
          .maybeSingle();

        if (existingRef) {
          return res.status(200).json({ 
            success: true, 
            message: 'Feedback already submitted',
            referralCode: existingRef.code 
          });
        }

        // 2. Save Testimonial
        const { error: testiError } = await supabase.from('testimonials').insert({
          name: order.full_name,
          title: `Klien ${order.selected_package}`,
          rating: rating,
          testimony: testimony,
          is_show: false, // Pending review
          order_index: 0
        });

        if (testiError) throw testiError;

        // 3. Generate Referral Code: REFNAME1234
        const namePart = order.full_name.split(' ')[0].toUpperCase().replace(/[^A-Z0-9]/g, '');
        const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
        const referralCode = `REF${namePart}${randomPart}`;

        // 4. Save Referral Code
        const { data: refData, error: refError } = await supabase.from('referral_codes').insert({
          code: referralCode,
          order_id: order.id,
          client_id: order.client_id,
          discount_value: 5,
          discount_type: 'percentage'
        }).select().single();

        if (refError) throw refError;

        return res.status(200).json({ 
          success: true, 
          message: 'Feedback submitted successfully',
          referralCode: referralCode 
        });
      } catch (e) { return res.status(500).json({ message: e.message }); }

    case 'validate-voucher':
      if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
      try {
        const { code } = req.query;
        if (!code) return res.status(400).json({ message: 'Code is required' });

        const { data: voucher, error: vError } = await supabase
          .from('referral_codes')
          .select('*, orders!referral_codes_order_id_fkey(full_name)')
          .eq('code', code.toUpperCase())
          .maybeSingle();

        if (vError) throw vError;
        if (!voucher) return res.status(404).json({ message: 'Voucher tidak ditemukan' });
        if (voucher.is_used) return res.status(400).json({ message: 'Voucher sudah pernah digunakan' });

        return res.status(200).json({ 
          success: true, 
          voucher: {
            ...voucher,
            issuer_name: voucher.orders?.full_name
          }
        });
      } catch (e) { return res.status(500).json({ message: e.message }); }

    case 'apply-voucher':
      if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
      try {
        const { orderNumber, voucherCode } = req.body;
        if (!orderNumber || !voucherCode) return res.status(400).json({ message: 'Missing fields' });

        // 1. Validate voucher AGAIN (security)
        const { data: voucher, error: vError } = await supabase
          .from('referral_codes')
          .select('*')
          .eq('code', voucherCode.toUpperCase())
          .maybeSingle();

        if (vError || !voucher) return res.status(404).json({ message: 'Voucher tidak valid' });
        if (voucher.is_used) return res.status(400).json({ message: 'Voucher sudah digunakan' });

        // 2. Update Order
        const { error: oError } = await supabase
          .from('orders')
          .update({
            discount_value: voucher.discount_value,
            discount_type: voucher.discount_type,
            referral_id: voucher.id,
            voucher_code: voucherCode.toUpperCase()
          })
          .eq('order_number', orderNumber);

        if (oError) throw oError;

        // 3. Mark Voucher as used
        const { error: vuError } = await supabase
          .from('referral_codes')
          .update({ is_used: true })
          .eq('id', voucher.id);

        if (vuError) throw vuError;

        return res.status(200).json({ success: true, message: 'Voucher berhasil diterapkan' });
      } catch (e) { return res.status(500).json({ message: e.message }); }

    default:
      return res.status(400).json({ message: 'Invalid action' });
  }
}
