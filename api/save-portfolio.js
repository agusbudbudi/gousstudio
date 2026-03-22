export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { data, password } = req.body;
  const { GITHUB_TOKEN, REPO_OWNER, REPO_NAME, CMS_PASSWORD } = process.env;

  if (password !== CMS_PASSWORD) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
    return res.status(500).json({ message: 'Server configuration missing (GitHub credentials)' });
  }

  try {
    const path = 'src/data/portfolio.json';
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;

    // 1. Get current SHA
    const getRes = await fetch(url, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!getRes.ok) {
      const errorText = await getRes.text();
      throw new Error(`Failed to get file metadata: ${getRes.status} ${errorText}`);
    }

    const fileData = await getRes.json();
    const sha = fileData.sha;

    // 2. Put updated content
    const putRes = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Update portfolio from CMS',
        content: Buffer.from(JSON.stringify(data, null, 2)).toString('base64'),
        sha,
      }),
    });

    if (!putRes.ok) {
      const errorText = await putRes.text();
      throw new Error(`Failed to update file: ${putRes.status} ${errorText}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('CMS Error:', error);
    return res.status(500).json({ message: error.message });
  }
}
