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
  const { action } = req.query;
  const { CMS_PASSWORD, VITE_CMS_PASSWORD, SUPABASE_URL, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  const effectivePassword = CMS_PASSWORD || VITE_CMS_PASSWORD;
  const effectiveUrl = SUPABASE_URL || VITE_SUPABASE_URL;

  // Validate Auth
  if (!effectivePassword || getCmsToken(req) !== effectivePassword) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!effectiveUrl || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ message: 'Server configuration missing' });
  }

  const supabase = createClient(effectiveUrl, SUPABASE_SERVICE_ROLE_KEY);

  switch (action) {
    case 'get':
      if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
      try {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json({ success: true, data: data || [] });
      } catch (e) { return res.status(500).json({ message: e.message }); }

    case 'create':
      if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
      try {
        const { data, error } = await supabase.from('orders').insert(req.body.payload).select().single();
        if (error) throw error;
        return res.status(200).json({ success: true, data });
      } catch (e) { return res.status(500).json({ message: e.message }); }

    case 'update':
      if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
      try {
        const { data, error } = await supabase.from('orders').update(req.body.updates).eq('id', req.body.id).select();
        if (error) throw error;
        return res.status(200).json({ success: true, data });
      } catch (e) { return res.status(500).json({ message: e.message }); }

    case 'delete':
      if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
      try {
        const { error } = await supabase.from('orders').delete().eq('id', req.body.id);
        if (error) throw error;
        return res.status(200).json({ success: true, message: 'Deleted' });
      } catch (e) { return res.status(500).json({ message: e.message }); }

    default:
      return res.status(400).json({ message: 'Invalid action' });
  }
}
