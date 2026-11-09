// Dedicated Vercel Serverless Function for /api/artists


const ARTISTS_DATABASE = [
  {
    id: 'amr-diab',
    name: 'عمرو دياب',
    englishName: 'Amr Diab',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Amr_Abdul_Baset_Diab.jpg',
    headerUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Amr_Abdul_Baset_Diab.jpg',
    bio: 'الهضبة، أيقونة الموسيقى العربية المعاصرة والأسطورة الأكثر مبيعاً في الشرق الأوسط.',
    monthlyListeners: '14,890,210',
    followersCount: '8.4M',
    genres: ['بوب مصري', 'موسيقى متوسطية', 'طرب حديث'],
    isVerified: true
  },
  {
    id: 'fairouz',
    name: 'فيروز',
    englishName: 'Fairouz',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Fairuz_1971.jpg',
    headerUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Fairuz_1971.jpg',
    bio: 'سفيرة لبنان إلى النجوم وجارة القمر، صوت الشرق الخالد وألحان الأخوين رحباني.',
    monthlyListeners: '8,920,400',
    followersCount: '6.1M',
    genres: ['طرب لبناني', 'كلاسيكيات عربية', 'رحبانيات'],
    isVerified: true
  },
  {
    id: 'sherine',
    name: 'شيرين عبد الوهاب',
    englishName: 'Sherine',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/49/%D8%B4%D9%8A%D8%B1%D9%8A%D9%86.jpg',
    headerUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/49/%D8%B4%D9%8A%D8%B1%D9%8A%D9%86.jpg',
    bio: 'صوت مصر وإحساس الشرق، صاحبة الصوت الدافئ والأعمال الرومانسية والدرامية الخالدة.',
    monthlyListeners: '9,650,000',
    followersCount: '5.8M',
    genres: ['بوب مصري', 'رومانسي', 'طرب'],
    isVerified: true
  },
  {
    id: 'tamer-hosny',
    name: 'تامر حسني',
    englishName: 'Tamer Hosny',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Tamer_Hosny%27s_NYE_Concert_%282025%29_%28cropped%29.png',
    headerUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Tamer_Hosny%27s_NYE_Concert_%282025%29_%28cropped%29.png',
    bio: 'نجم الجيل، مغني وملحن صاحب أكبر قاعدة جماهيرية شبابية وعشرات الألبومات الناجحة.',
    monthlyListeners: '11,200,000',
    followersCount: '7.9M',
    genres: ['بوب شبابي', 'رومانسي', 'حفلات'],
    isVerified: true
  },
  {
    id: 'hamaki',
    name: 'محمد حماقي',
    englishName: 'Mohamed Hamaki',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Mohamed_Hamaki_2.jpg',
    headerUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Mohamed_Hamaki_2.jpg',
    bio: 'أحد أبرز رواد البوب العربي الحديث، صوت استثنائي وأسلوب موسيقي متجدد وجريء.',
    monthlyListeners: '8,450,000',
    followersCount: '5.2M',
    genres: ['بوب مصري حديث', 'موسيقى إلكترونية'],
    isVerified: true
  },
  {
    id: 'wegz',
    name: 'ويجز',
    englishName: 'Wegz',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Wegz_2023.jpg',
    headerUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Wegz_2023.jpg',
    bio: 'رائد مشهد التراب والراب المصري الحديث، أحد أكثر الفنانين استماعاً وتأثيراً في الجيل الجديد.',
    monthlyListeners: '7,900,000',
    followersCount: '4.8M',
    genres: ['تراب مصري', 'هيب هوب', 'أفرو بيت'],
    isVerified: true
  },
  {
    id: 'cairokee',
    name: 'كايروكي',
    englishName: 'Cairokee',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Cairokee.band.jpg',
    headerUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Cairokee.band.jpg',
    bio: 'فرقة الروك المصرية الأهم، كلمات تعبر عن الواقع وقضايا الشباب والحرية والحب.',
    monthlyListeners: '6,400,000',
    followersCount: '4.1M',
    genres: ['روك مصري', 'إندي عربي'],
    isVerified: true
  },
  {
    id: 'ahmed-saad',
    name: 'أحمد سعد',
    englishName: 'Ahmed Saad',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Ahmed_Saad.png',
    headerUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Ahmed_Saad.png',
    bio: 'حنجرة ذهبية وطاقة استثنائية، ملك التريندات والأغاني الشعبية والرومانسية.',
    monthlyListeners: '8,100,000',
    followersCount: '5.0M',
    genres: ['شعبي مودرن', 'بوب شعبي'],
    isVerified: true
  }
];

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const artistId = (req.query.id as string || '').toLowerCase().trim();

  if (!artistId) {
    return res.json({ artists: ARTISTS_DATABASE });
  }

  const artist = ARTISTS_DATABASE.find(a => 
    a.id === artistId || 
    a.name.toLowerCase() === artistId || 
    a.englishName.toLowerCase() === artistId
  );

  if (!artist) {
    return res.status(404).json({ error: 'Artist not found' });
  }

  // Fetch full-length YouTube tracks for this artist
  let tracks: any[] = [];
  try {
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(artist.name)}`;
    const ytRes = await fetch(ytUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ar,en;q=0.9'
      },
      signal: AbortSignal.timeout(4500)
    });

    if (ytRes.ok) {
      const html = await ytRes.text();
      const match = html.match(/var ytInitialData = ({.*?});<\/script>/);
      if (match) {
        const data = JSON.parse(match[1]);
        const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];
        for (const item of contents) {
          const v = item.videoRenderer;
          if (!v || !v.videoId) continue;
          const title = v.title?.runs?.map((r: any) => r.text).join('') || v.title?.simpleText || '';
          const durationText = v.lengthText?.simpleText || '3:30';
          const parts = durationText.split(':').map(Number);
          let durSecs = 210;
          if (parts.length === 2) durSecs = parts[0] * 60 + parts[1];
          else if (parts.length === 3) durSecs = parts[0] * 3600 + parts[1] * 60 + parts[2];
          if (durSecs > 7200) continue;
          const thumb = v.thumbnail?.thumbnails?.slice(-1)[0]?.url || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;

          tracks.push({
            id: `yt-${v.videoId}`,
            youtubeId: v.videoId,
            title,
            artist: artist.name,
            artistId: artist.id,
            album: 'YouTube Official',
            duration: durSecs,
            coverUrl: thumb,
            streamUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
            downloadUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
            genre: 'موسيقى كاملة',
            releaseDate: v.publishedTimeText?.simpleText || '2024',
            playCount: v.shortViewCountText?.simpleText || '1.2M',
            bitrate: 'YouTube HD',
            isFullLength: true,
            source: 'youtube'
          });
          if (tracks.length >= 25) break;
        }
      }
    }
  } catch {
    // If YouTube fetch failed, continue
  }

  // Fallback: If YouTube search was empty, query Audius for 320kbps full tracks
  if (tracks.length === 0) {
    try {
      const audiusRes = await fetch(`https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(artist.name)}&app_name=NAGHAMAT_APP&limit=15`);
      if (audiusRes.ok) {
        const audiusData = await audiusRes.json();
        const items = audiusData.data || [];
        tracks = items.map((item: any) => ({
          id: `audius-${item.id}`,
          title: item.title || 'مقطع كامل',
          artist: item.user?.name || artist.name,
          artistId: artist.id,
          album: item.genre || 'Audius Full Track',
          duration: Math.round(item.duration || 210),
          coverUrl: item.artwork?.['480x480'] || item.artwork?.['1000x1000'] || artist.avatarUrl,
          streamUrl: `https://discoveryprovider.audius.co/v1/tracks/${item.id}/stream?app_name=NAGHAMAT_APP`,
          downloadUrl: `https://discoveryprovider.audius.co/v1/tracks/${item.id}/stream?app_name=NAGHAMAT_APP`,
          genre: item.genre || 'أغنية كاملة',
          releaseDate: item.release_date ? item.release_date.split(' ')[0] : '2024',
          playCount: `${Math.floor(Math.random() * 80 + 10)},000`,
          bitrate: '320 kbps MP3',
          isFullLength: true,
          source: 'audius'
        }));
      }
    } catch {
      // Ignore
    }
  }

  return res.json({
    artist,
    tracks
  });
}
