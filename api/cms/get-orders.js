import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { 
    SUPABASE_URL, 
    VITE_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY, 
    CMS_PASSWORD, 
    VITE_CMS_PASSWORD 
  } = process.env;

  const effectiveUrl = SUPABASE_URL || VITE_SUPABASE_URL;
  const effectivePassword = CMS_PASSWORD || VITE_CMS_PASSWORD;

  // Extract cms_token from cookies
  const cookies = (req.headers.cookie || '').split(';');
  let cmsToken = null;
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.trim().split('=');
    if (name === 'cms_token') {
      cmsToken = decodeURIComponent(rest.join('='));
      break;
    }
  }

  // Validate Authentication
  if (!effectivePassword || cmsToken !== effectivePassword) {
    return res.status(401).json({ message: 'Unauthorized. You must be logged into the CMS.' });
  }

  // Validate Server Config
  if (!effectiveUrl || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ message: 'Server configuration missing' });
  }

  // Use Service Role to bypass RLS - only admins can list all orders
  const supabase = createClient(effectiveUrl, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Get Orders Error:', error);
    return res.status(500).json({ message: error.message });
  }
}
