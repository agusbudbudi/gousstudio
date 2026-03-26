export default async function handler(req, res) {
  const { action } = req.query;
  const { CMS_PASSWORD, VITE_CMS_PASSWORD } = process.env;
  const effectivePassword = CMS_PASSWORD || VITE_CMS_PASSWORD;
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

  // Helper to extract token
  const getCmsToken = () => {
    const cookies = (req.headers.cookie || '').split(';');
    for (const cookie of cookies) {
      const [name, ...rest] = cookie.trim().split('=');
      if (name === 'cms_token') return decodeURIComponent(rest.join('='));
    }
    return null;
  };

  switch (action) {
    case 'login':
      if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
      const { password } = req.body;
      if (!password || password !== effectivePassword) {
        return res.status(401).json({ success: false, message: 'Password tidak valid' });
      }
      const loginCookie = `cms_token=${encodeURIComponent(password)}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Strict${isProd ? '; Secure' : ''}`;
      res.setHeader('Set-Cookie', loginCookie);
      return res.status(200).json({ success: true, message: 'Login berhasil' });

    case 'logout':
      if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
      const logoutCookie = `cms_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict${isProd ? '; Secure' : ''}`;
      res.setHeader('Set-Cookie', logoutCookie);
      return res.status(200).json({ success: true, message: 'Logout berhasil' });

    case 'check':
      if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
      const token = getCmsToken();
      if (token && token === effectivePassword) {
        return res.status(200).json({ isAuthenticated: true });
      }
      return res.status(401).json({ isAuthenticated: false });

    default:
      return res.status(400).json({ message: 'Invalid action' });
  }
}
