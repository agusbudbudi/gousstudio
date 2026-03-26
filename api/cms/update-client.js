import { createClient } from "@supabase/supabase-js";

function getCmsToken(req) {
  const cookies = (req.headers.cookie || '').split(';');
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.trim().split('=');
    if (name === 'cms_token') return decodeURIComponent(rest.join('='));
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { id, updates } = req.body;
  if (!id || !updates) return res.status(400).json({ message: 'Missing id or updates' });

  const { CMS_PASSWORD, VITE_CMS_PASSWORD, SUPABASE_URL, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  const effectivePassword = CMS_PASSWORD || VITE_CMS_PASSWORD;
  const effectiveUrl = SUPABASE_URL || VITE_SUPABASE_URL;

  if (!effectivePassword || getCmsToken(req) !== effectivePassword)
    return res.status(401).json({ message: 'Unauthorized' });

  if (!effectiveUrl || !SUPABASE_SERVICE_ROLE_KEY)
    return res.status(500).json({ message: 'Server configuration missing' });

  const supabase = createClient(effectiveUrl, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Update the client record
    const { error: clientError } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id);

    if (clientError) throw clientError;

    // Cascade name & phone changes to all linked orders
    if (updates.full_name || updates.phone_number) {
      const cascadePayload = {};
      if (updates.full_name) cascadePayload.full_name = updates.full_name;
      if (updates.phone_number !== undefined) cascadePayload.phone_number = updates.phone_number;

      await supabase
        .from('orders')
        .update(cascadePayload)
        .eq('client_id', id);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
