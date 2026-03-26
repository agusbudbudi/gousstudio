export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Clear the HttpOnly cookie
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  const cookieString = `cms_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict${isProd ? '; Secure' : ''}`;

  res.setHeader('Set-Cookie', cookieString);
  return res.status(200).json({ success: true, message: 'Logout berhasil' });
}
