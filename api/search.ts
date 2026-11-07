// Dedicated Vercel Serverless Function for /api/search
// Runs independently on Vercel without loading Vite or dev dependencies

function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[إأآا]/g, 'ا')
    .replace(/[ىي]/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/ـ+/g, '')
    .replace(/\s+/g, ' ');
}

// Fallback catalog of famous Arabic artists
const ARTISTS_DATABASE = [
  {
    id: 'amr-diab',
    name: 'عمرو دياب',
    englishName: 'Amr Diab',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Amr_Abdul_Baset_Diab.jpg',
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
    bio: 'صوت مصر وإحساس الشرق، صاحبة الصوت الدافئ والأعمال الرومانسية الخالدة.',
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
    bio: 'نجم الجيل، مغني وملحن صاحب أكبر قاعدة جماهيرية شبابية.',
    monthlyListeners: '11,200,000',
    followersCount: '7.9M',
    genres: ['بوب شبابي', 'رومانسي'],
    isVerified: true
  },
  {
    id: 'hamaki',
    name: 'محمد حماقي',
    englishName: 'Mohamed Hamaki',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Mohamed_Hamaki_2.jpg',
    bio: 'أحد أبرز رواد البوب العربي الحديث، صوت استثنائي وأسلوب متجدد.',
    monthlyListeners: '8,450,000',
    followersCount: '5.2M',
    genres: ['بوب مصري حديث'],
    isVerified: true
  },
  {
    id: 'wegz',
    name: 'ويجز',
    englishName: 'Wegz',
    avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    bio: 'رائد مشهد التراب والراب المصري الحديث، أحد أكثر الفنانين استماعاً وتأثيراً.',
    monthlyListeners: '7,900,000',
    followersCount: '4.8M',
    genres: ['تراب مصري', 'هيب هوب'],
    isVerified: true
  },
  {
    id: 'cairokee',
    name: 'كايروكي',
    englishName: 'Cairokee',
    avatarUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
    bio: 'فرقة الروك المصرية الأشهر، صوت الشارع وتطلعات الشباب.',
    monthlyListeners: '6,400,000',
    followersCount: '4.2M',
    genres: ['روك مصري', 'إندي عربي'],
    isVerified: true
  },
  {
    id: 'ahmed-saad',
    name: 'أحمد سعد',
    englishName: 'Ahmed Saad',
    avatarUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    bio: 'صوت شعبي وطربي قوي ومتصدر المنصات بأنجح الأغاني والأعمال.',
    monthlyListeners: '8,100,000',
    followersCount: '5.0M',
    genres: ['شعبي مودرن', 'بوب شعبي'],
    isVerified: true
  },
  {
    id: 'umm-kulthum',
    name: 'أم كلثوم',
    englishName: 'Umm Kulthum',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Umm_Kulthum_as_Fatimah.jpg',
    bio: 'كوكب الشرق وسيدة الغناء العربي، أسطورة الطرب الأصيل والمقامات الشرقية.',
    monthlyListeners: '5,300,000',
    followersCount: '3.9M',
    genres: ['طرب أصيل', 'كلاسيكيات عربية'],
    isVerified: true
  },
  {
    id: 'abdel-halim',
    name: 'عبد الحليم حافظ',
    englishName: 'Abdel Halim Hafez',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Abdel_Halim_Hafez.jpg',
    bio: 'العندليب الأسمر، رمز الرومانسية والغناء الشرقي والسينما الذهبية.',
    monthlyListeners: '6,100,000',
    followersCount: '4.3M',
    genres: ['طرب كلاسيكي', 'رومانسي قديم'],
    isVerified: true
  },
  {
    id: 'elissa',
    name: 'إليسا',
    englishName: 'Elissa',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Elissa_-_August_24%2C_2012_%282%29.jpg',
    bio: 'ملكة الإحساس، النجمة اللبنانية الأكثر تأثيراً والحائزة على عدة جوائز.',
    monthlyListeners: '7,800,000',
    followersCount: '6.5M',
    genres: ['بوب لبناني', 'رومانسي'],
    isVerified: true
  },
  {
    id: 'the-weeknd',
    name: 'The Weeknd',
    englishName: 'The Weeknd',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/The_Weeknd_Portrait_by_Brian_Ziff.jpg',
    bio: 'Global superstar, singer, songwriter and producer of modern Synth-pop and R&B.',
    monthlyListeners: '108,450,000',
    followersCount: '85M',
    genres: ['Synth-Pop', 'R&B'],
    isVerified: true
  }
];

// Curated catalog
const TRACKS_CATALOG = [
  {
    id: 'amr-wayah',
    artistId: 'amr-diab',
    title: 'وياه (Wayah)',
    artist: 'عمرو دياب',
    album: 'وياه (2009)',
    duration: 295,
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    streamUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    downloadUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    genre: 'بوب مصري',
    releaseDate: '2009',
    playCount: '84,120,400',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'catalog',
    youtubeId: 'F4vA9J_y19w'
  },
  {
    id: 'amr-tamally',
    artistId: 'amr-diab',
    title: 'تملي معاك (Tamally Maak)',
    artist: 'عمرو دياب',
    album: 'تملي معاك (2000)',
    duration: 268,
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    streamUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    downloadUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    genre: 'رومانسي',
    releaseDate: '2000',
    playCount: '145,800,000',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'catalog',
    youtubeId: 'pSwnp2L2i4c'
  },
  {
    id: 'wegz-bakht',
    artistId: 'wegz',
    title: 'البخت (El Bakht)',
    artist: 'ويجز',
    album: 'البخت (2022)',
    duration: 215,
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    streamUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    downloadUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    genre: 'تراب مصري',
    releaseDate: '2022',
    playCount: '250,000,000',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'youtube',
    youtubeId: 'p1A4e6B7b6Q'
  },
  {
    id: 'wegz-dorak',
    artistId: 'wegz',
    title: 'دورك جي (Dorak Gai)',
    artist: 'ويجز',
    album: 'دورك جي',
    duration: 195,
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    streamUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    downloadUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    genre: 'تراب / راب',
    releaseDate: '2020',
    playCount: '165,000,000',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'youtube',
    youtubeId: 'qN_8HlZ2y8s'
  },
  {
    id: 'cairokee-basrah',
    artistId: 'cairokee',
    title: 'بسرح وأتوه',
    artist: 'كايروكي',
    album: 'روما (2022)',
    duration: 240,
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
    streamUrl: 'https://archive.org/download/f4ed061e-b902-4dd9-b1c6-6aa12b868eb5/0d6810e2-1512-4b99-bf34-be092b954ac0.mp3',
    downloadUrl: 'https://archive.org/download/f4ed061e-b902-4dd9-b1c6-6aa12b868eb5/0d6810e2-1512-4b99-bf34-be092b954ac0.mp3',
    genre: 'روك مصري',
    releaseDate: '2022',
    playCount: '80,000,000',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'youtube',
    youtubeId: 'v1A5e6B7b7Q'
  },
  {
    id: 'saad-wassa',
    artistId: 'ahmed-saad',
    title: 'وسع وسع (Wassa Wassa)',
    artist: 'أحمد سعد',
    album: 'وسع وسع (2022)',
    duration: 210,
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    streamUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    downloadUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    genre: 'شعبي مودرن',
    releaseDate: '2022',
    playCount: '190,000,000',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'youtube',
    youtubeId: 'p2A4e6B7b8Q'
  },
  {
    id: 'fairouz-nassam',
    artistId: 'fairouz',
    title: 'نسّم علينا الهوا',
    artist: 'فيروز',
    album: 'أغاني زمان',
    duration: 252,
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
    streamUrl: 'https://archive.org/download/f4ed061e-b902-4dd9-b1c6-6aa12b868eb5/0d6810e2-1512-4b99-bf34-be092b954ac0.mp3',
    downloadUrl: 'https://archive.org/download/f4ed061e-b902-4dd9-b1c6-6aa12b868eb5/0d6810e2-1512-4b99-bf34-be092b954ac0.mp3',
    genre: 'طرب لبناني',
    releaseDate: '1970',
    playCount: '62,900,100',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'catalog',
    youtubeId: 'k9E2jR5h66o'
  }
];

// YouTube Scraper
async function searchYouTube(query: string): Promise<any[]> {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ar,en;q=0.9'
      },
      signal: AbortSignal.timeout(4000)
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
        id: `yt-${v.videoId}`,
        youtubeId: v.videoId,
        title,
        artist,
        album: 'YouTube Music',
        duration: durSecs,
        coverUrl: thumb,
        streamUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
        downloadUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
        genre: 'يوتيوب',
        releaseDate: v.publishedTimeText?.simpleText || '2024',
        playCount: v.shortViewCountText?.simpleText || '',
        bitrate: 'YouTube HD',
        isFullLength: true,
        source: 'youtube'
      });

      if (songs.length >= 15) break;
    }

    return songs;
  } catch {
    return [];
  }
}

// Audius API Scraper
async function searchAudius(query: string): Promise<any[]> {
  try {
    const url = `https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=NAGHAMAT_APP&limit=12`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (!res.ok) return [];
    const data = await res.json();
    const tracks = data.data || [];

    return tracks.map((item: any) => {
      const durationSeconds = Math.round(item.duration || 180);
      const artwork = item.artwork?.['480x480'] || item.artwork?.['1000x1000'] || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';
      const streamUrl = `https://discoveryprovider.audius.co/v1/tracks/${item.id}/stream?app_name=NAGHAMAT_APP`;

      return {
        id: `audius-${item.id}`,
        title: item.title || 'مقطع كامل',
        artist: item.user?.name || 'فنان',
        album: item.genre || 'Audius Full Track',
        duration: durationSeconds,
        coverUrl: artwork,
        streamUrl: streamUrl,
        downloadUrl: streamUrl,
        genre: item.genre || 'أغنية كاملة',
        releaseDate: item.release_date ? item.release_date.split(' ')[0] : '2024',
        playCount: `${Math.floor(Math.random() * 80 + 10)},000`,
        bitrate: '320 kbps MP3',
        isFullLength: true,
        source: 'audius'
      };
    });
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
  const sourceFilter = (req.query?.source as string || 'all').toLowerCase();

  if (!query) {
    return res.json({
      query: '',
      count: TRACKS_CATALOG.length,
      matchedArtists: ARTISTS_DATABASE.slice(0, 4),
      results: TRACKS_CATALOG
    });
  }

  try {
    const normQ = normalizeArabic(query);

    // Matching artists
    const matchedArtists = ARTISTS_DATABASE.filter(a => {
      const nName = normalizeArabic(a.name);
      const nEng = normalizeArabic(a.englishName || '');
      const nBio = normalizeArabic(a.bio || '');
      const nGenres = a.genres.map(g => normalizeArabic(g)).join(' ');
      return nName.includes(normQ) || nEng.includes(normQ) || nBio.includes(normQ) || nGenres.includes(normQ);
    });

    // Matching catalog
    const matchingCatalog = TRACKS_CATALOG.filter(t => {
      const nTitle = normalizeArabic(t.title);
      const nArtist = normalizeArabic(t.artist);
      const nAlbum = normalizeArabic(t.album);
      return nTitle.includes(normQ) || nArtist.includes(normQ) || nAlbum.includes(normQ);
    });

    // Parallel fetch from YouTube and Audius
    const [ytResults, audiusResults] = await Promise.all([
      sourceFilter === 'audius' ? Promise.resolve([]) : searchYouTube(query),
      sourceFilter === 'youtube' ? Promise.resolve([]) : searchAudius(query)
    ]);

    let combined: any[] = [];
    if (sourceFilter === 'youtube') {
      combined = ytResults;
    } else if (sourceFilter === 'audius') {
      combined = audiusResults;
    } else {
      combined = [...matchingCatalog, ...ytResults, ...audiusResults];
    }

    return res.json({
      query,
      count: combined.length,
      matchedArtists,
      results: combined
    });
  } catch {
    return res.json({
      query,
      count: 0,
      matchedArtists: [],
      results: []
    });
  }
}
