// Dedicated Vercel Serverless Function for /api/resolve-youtube
// Resolves any song title/artist to an authentic full-length YouTube video ID

async function searchYouTube(query: string): Promise<any[]> {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ar,en;q=0.9'
      },
      signal: AbortSignal.timeout(4500)
    });

    if (!res.ok) return [];
    const html = await res.text();
    const match = html.match(/var ytInitialData = ({.*?});<\/script>/);
    if (!match) return [];

    const data = JSON.parse(match[1]);
    const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];
    const songs: any[] = [];

    for (const item of contents) {
      const v = item.videoRenderer;
      if (!v || !v.videoId) continue;

      const title = v.title?.runs?.map((r: any) => r.text).join('') || v.title?.simpleText || '';
      const artist = v.ownerText?.runs?.[0]?.text || '';
      const durationText = v.lengthText?.simpleText || '3:30';

      const parts = durationText.split(':').map(Number);
      let durSecs = 210;
      if (parts.length === 2) durSecs = parts[0] * 60 + parts[1];
      else if (parts.length === 3) durSecs = parts[0] * 3600 + parts[1] * 60 + parts[2];

      if (durSecs > 7200) continue;

      const thumb = v.thumbnail?.thumbnails?.slice(-1)[0]?.url || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;

      songs.push({
        youtubeId: v.videoId,
        title,
        artist,
        duration: durSecs,
        coverUrl: thumb
      });

      if (songs.length >= 5) break;
    }

    return songs;
  } catch {
    return [];
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = (req.query?.q as string || '').trim();
  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter q' });
  }

  try {
    const results = await searchYouTube(query);
    if (results.length > 0) {
      const best = results[0];
      return res.json({
        success: true,
        youtubeId: best.youtubeId,
        duration: best.duration || 210,
        title: best.title,
        coverUrl: best.coverUrl
      });
    }

    return res.json({ success: false, youtubeId: null });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
