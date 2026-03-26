import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {
    const origin = req.headers.origin || '';
    res.setHeader("Access-Control-Allow-Origin", origin || '*');
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Vary", "Origin");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { order_id } = req.query || {};

    if (!order_id) {
      return res.status(400).json({ message: "Missing order_id" });
    }

    const { SUPABASE_URL, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_ANON_KEY } = process.env;
    const effectiveUrl = SUPABASE_URL || VITE_SUPABASE_URL;
    const effectiveKey = SUPABASE_SERVICE_ROLE_KEY || VITE_SUPABASE_ANON_KEY;

    if (!effectiveUrl || !effectiveKey) {
      return res.status(500).json({ message: 'Server configuration missing' });
    }

    const supabaseStore = createClient(effectiveUrl, effectiveKey);

    // Fetch order from our database
    const { data: order, error } = await supabaseStore
      .from("orders")
      .select("status, paid_at")
      .eq("order_number", order_id)
      .single();

    if (error || !order) {
      return res.status(404).json({ message: "Order not found", error: error?.message });
    }

    const isPaid = order.status === "IN PROGRESS" || order.status === "SUCCESS" || !!order.paid_at;

    return res.status(200).json({
      status: isPaid ? "completed" : "pending",
      orderStatus: order.status,
    });
  } catch (err) {
    console.error("transaction-status error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
}

