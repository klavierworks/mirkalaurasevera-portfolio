import type { NextApiRequest, NextApiResponse } from 'next';
export const runtime = 'edge';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid URL parameter' });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch data' });
    }

    // Forward the headers from the Vimeo response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
    res.send(await response.text());
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
