// Dedicated Vercel Serverless Function for /api/trending

const DEFAULT_ARTISTS = [
  {
    id: 'amr-diab',
    name: 'عمرو دياب',
    englishName: 'Amr Diab',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Amr_Abdul_Baset_Diab.jpg',
    bio: 'الهضبة، أيقونة الموسيقى العربية المعاصرة والأسطورة الأكثر مبيعاً في الشرق الأوسط.',
    monthlyListeners: '14,890,210',
    followersCount: '8.4M',
    genres: ['بوب مصري', 'موسيقى متوسطية'],
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
    genres: ['طرب لبناني', 'كلاسيكيات عربية'],
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
    genres: ['بوب مصري', 'رومانسي'],
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
  }
];

const DEFAULT_TRACKS = [
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

export default function handler(_req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  res.json({
    featured: DEFAULT_TRACKS,
    artists: DEFAULT_ARTISTS,
    genres: [
      { id: 'arabic', name: 'طرب وبوب عربي', icon: '🎵', count: 64 },
      { id: 'pop', name: 'Pop & International', icon: '🌍', count: 120 },
      { id: 'lofi', name: 'لو فاي واسترخاء (Lo-Fi)', icon: '☕', count: 42 },
      { id: 'remix', name: 'ريمكس وسهرات DJ', icon: '🔥', count: 55 },
    ]
  });
}
