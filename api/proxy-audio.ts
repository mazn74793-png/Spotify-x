// Dedicated Vercel Serverless Function for /api/proxy-audio
import { Readable } from 'stream';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const audioUrl = req.query.url as string;
  if (!audioUrl) {
    return res.status(400).send('Missing url parameter');
  }

  try {
    const upstreamRes = await fetch(audioUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        ...(req.headers.range ? { 'Range': req.headers.range } : {})
      },
      redirect: 'follow'
    });

    if (!upstreamRes.ok && upstreamRes.status !== 206) {
      return res.status(upstreamRes.status).send('Upstream audio fetch failed');
    }

    res.status(upstreamRes.status);

    const passHeaders = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
      'cache-control'
    ];

    passHeaders.forEach(h => {
      const val = upstreamRes.headers.get(h);
      if (val) res.setHeader(h, val);
    });

    res.setHeader('Cache-Control', 'public, max-age=86400');

    if (upstreamRes.body) {
      const nodeStream = Readable.fromWeb(upstreamRes.body as any);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (err: any) {
    res.status(502).send(`Audio proxy error: ${err.message}`);
  }
}
