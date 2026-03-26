import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { password } = req.body;
  const { CMS_PASSWORD, VITE_CMS_PASSWORD } = process.env;
  const effectivePassword = CMS_PASSWORD || VITE_CMS_PASSWORD;

  if (!password || password !== effectivePassword) {
    return res.status(401).json({ success: false, message: 'Password tidak valid' });
  }

  // Create HttpOnly Secure cookie
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  const maxAge = 60 * 60 * 24; // 1 day in seconds
  
  // Set the password as the token for simplicity, wrapped in a secure cookie
  const cookieString = `cms_token=${encodeURIComponent(password)}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Strict${isProd ? '; Secure' : ''}`;

  res.setHeader('Set-Cookie', cookieString);
  return res.status(200).json({ success: true, message: 'Login berhasil' });
}
