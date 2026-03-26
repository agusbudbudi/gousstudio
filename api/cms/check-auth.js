export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { CMS_PASSWORD, VITE_CMS_PASSWORD } = process.env;
  const effectivePassword = CMS_PASSWORD || VITE_CMS_PASSWORD;

  const cookies = (req.headers.cookie || '').split(';');
  let cmsToken = null;
  
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.trim().split('=');
    if (name === 'cms_token') {
      cmsToken = decodeURIComponent(rest.join('='));
      break;
    }
  }

  if (cmsToken && cmsToken === effectivePassword) {
    return res.status(200).json({ isAuthenticated: true });
  }

  return res.status(401).json({ isAuthenticated: false });
}
