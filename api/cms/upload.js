import { handleUpload } from "@vercel/blob/client";

const ALLOWED_FOLDER = "portfolio/";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { CMS_PASSWORD, BLOB_READ_WRITE_TOKEN } = process.env;
  const effectivePassword = CMS_PASSWORD;

  const body = req.body;

  // Upload-completed callbacks come from Vercel (signed), not the browser — no cookie there.
  if (body?.type !== 'blob.upload-completed') {
    const cookies = (req.headers.cookie || '').split(';');
    let cmsToken = null;
    for (const cookie of cookies) {
      const [name, ...rest] = cookie.trim().split('=');
      if (name === 'cms_token') {
        cmsToken = decodeURIComponent(rest.join('='));
        break;
      }
    }

    if (!effectivePassword || cmsToken !== effectivePassword) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }

  if (!BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ message: 'Server configuration missing (BLOB_READ_WRITE_TOKEN)' });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith(ALLOWED_FOLDER) || pathname.includes('..')) {
          throw new Error('Invalid upload path');
        }
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          maximumSizeInBytes: 10 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      // DB is updated through the regular portfolio save flow.
      onUploadCompleted: async () => {},
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(400).json({ message: error.message });
  }
}
