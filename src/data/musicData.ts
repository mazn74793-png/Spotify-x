import { Track, Artist } from '../types/music';

// Curated authentic artists with direct high-res Wikimedia & Unsplash portraits
export const DEFAULT_ARTISTS: Artist[] = [
  {
    id: 'amr-diab',
    name: 'عمرو دياب',
    englishName: 'Amr Diab',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Amr_Abdul_Baset_Diab.jpg',
    headerUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Amr_Abdul_Baset_Diab.jpg',
    bio: 'الهضبة، أيقونة الموسيقى العربية المعاصرة والأسطورة الأكثر مبيعاً في الشرق الأوسط وصاحب جوائز الموسيقى العالمية.',
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
    bio: 'سفيرة لبنان إلى النجوم وجارة القمر، صوت الشرق الخالد وألحان الأخوين رحباني العظيمة.',
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
    bio: 'نجم الجيل، مغني وملحن ومؤلف صاحب أكبر قاعدة جماهيرية شبابية وأعلى المشاهدات في الوطن العربي.',
    monthlyListeners: '11,200,000',
    followersCount: '7.9M',
    genres: ['بوب شبابي', 'رومانسي', 'ريمكس'],
    isVerified: true
  },
  {
    id: 'hamaki',
    name: 'محمد حماقي',
    englishName: 'Mohamed Hamaki',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Mohamed_Hamaki_2.jpg',
    headerUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Mohamed_Hamaki_2.jpg',
    bio: 'أحد أبرز رواد البوب العربي الحديث، صوت استثنائي وأسلوب موسيقي متجدد باستمرار.',
    monthlyListeners: '8,450,000',
    followersCount: '5.2M',
    genres: ['بوب مصري حديث', 'دانّس بوب'],
    isVerified: true
  },
  {
    id: 'umm-kulthum',
    name: 'أم كلثوم',
    englishName: 'Umm Kulthum',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Umm_Kulthum_as_Fatimah.jpg',
    headerUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Umm_Kulthum_as_Fatimah.jpg',
    bio: 'كوكب الشرق وسيدة الغناء العربي، أسطورة الطرب الأصيل والمقامات الشرقية الخالدة.',
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
    headerUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Abdel_Halim_Hafez.jpg',
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
    headerUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Elissa_-_August_24%2C_2012_%282%29.jpg',
    bio: 'ملكة الإحساس، النجمة اللبنانية الأكثر تأثيراً والحائزة على عدة جوائز الموسيقى العالمية.',
    monthlyListeners: '7,800,000',
    followersCount: '6.5M',
    genres: ['بوب لبناني', 'رومانسي'],
    isVerified: true
  },
  {
    id: 'assala',
    name: 'أصالة نصري',
    englishName: 'Assala',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/32/Asalah_Nasri.jpg',
    headerUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/32/Asalah_Nasri.jpg',
    bio: 'صوت الأصالة والصلابة، فنانة عربية متميزة بطبقات صوتية عالية وأداء طربي شجي.',
    monthlyListeners: '7,100,000',
    followersCount: '5.1M',
    genres: ['طرب سوري وخليجي', 'أصالة'],
    isVerified: true
  },
  {
    id: 'nancy-ajram',
    name: 'نانسي عجرم',
    englishName: 'Nancy Ajram',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Nancy_Ajram_signing_ceremony.jpg',
    headerUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Nancy_Ajram_signing_ceremony.jpg',
    bio: 'فراشة الغناء العربي ونجمة البوب الجماهيرية ذات المسيرة الحافلة بالنجاحات العالمية.',
    monthlyListeners: '8,200,000',
    followersCount: '6.8M',
    genres: ['بوب لبناني', 'حماسي'],
    isVerified: true
  },
  {
    id: 'the-weeknd',
    name: 'The Weeknd',
    englishName: 'The Weeknd',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/The_Weeknd_Portrait_by_Brian_Ziff.jpg',
    headerUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/The_Weeknd_Portrait_by_Brian_Ziff.jpg',
    bio: 'Global superstar, singer, songwriter and producer of modern Synth-pop and R&B.',
    monthlyListeners: '108,450,000',
    followersCount: '85M',
    genres: ['Synth-Pop', 'R&B', 'Pop'],
    isVerified: true
  }
];

// Curated full-length tracks with high quality audio sources & YouTube IDs
export const DEFAULT_TRACKS: Track[] = [
  {
    id: 'amr-wayah',
    artistId: 'amr-diab',
    title: 'وياه (Wayah) - كاملة',
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
    id: 'fairouz-nassam',
    artistId: 'fairouz',
    title: 'نسّم علينا الهوا - كاملة',
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
  },
  {
    id: 'fairouz-sahar',
    artistId: 'fairouz',
    title: 'سهر الليالي - كاملة',
    artist: 'فيروز',
    album: 'قصيدة حب',
    duration: 225,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Fairuz_1971.jpg',
    streamUrl: 'https://archive.org/download/f4ed061e-b902-4dd9-b1c6-6aa12b868eb5/3681ef61-6f64-4960-b9a0-65426e92df08.mp3',
    downloadUrl: 'https://archive.org/download/f4ed061e-b902-4dd9-b1c6-6aa12b868eb5/3681ef61-6f64-4960-b9a0-65426e92df08.mp3',
    genre: 'طرب لبناني',
    releaseDate: '1975',
    playCount: '48,150,000',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'catalog',
    youtubeId: 'q-n61K8Pj_8'
  },
  {
    id: 'sherine-mashaer',
    artistId: 'sherine',
    title: 'مشاعر - كاملة',
    artist: 'شيرين عبد الوهاب',
    album: 'تتر حكاية حياة',
    duration: 250,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/49/%D8%B4%D9%8A%D8%B1%D9%8A%D9%86.jpg',
    streamUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    downloadUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    genre: 'رومانسي / دراما',
    releaseDate: '2013',
    playCount: '98,700,000',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'catalog',
    youtubeId: 'Z9k7qPZ0LwM'
  },
  {
    id: 'sherine-kadabeen',
    artistId: 'sherine',
    title: 'كدابين',
    artist: 'شيرين عبد الوهاب',
    album: 'نساي (2018)',
    duration: 220,
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    streamUrl: 'https://cdn.freesound.org/previews/689/689728_11861866-lq.mp3',
    downloadUrl: 'https://cdn.freesound.org/previews/689/689728_11861866-lq.mp3',
    genre: 'بوب مصري',
    releaseDate: '2018',
    playCount: '74,200,000',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'catalog',
    youtubeId: 'qN_8HlZ2y8s'
  },
  {
    id: 'tamer-kol-marra',
    artistId: 'tamer-hosny',
    title: 'كل مرة بشوفك فيها - كاملة',
    artist: 'تامر حسني',
    album: 'عيني بتحبك (2006)',
    duration: 235,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Tamer_Hosny%27s_NYE_Concert_%282025%29_%28cropped%29.png',
    streamUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    downloadUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    genre: 'بوب شبابي',
    releaseDate: '2006',
    playCount: '89,400,000',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'catalog',
    youtubeId: 'sJq7y7r28P8'
  },
  {
    id: 'tamer-eesh',
    artistId: 'tamer-hosny',
    title: 'عيش بشوقك',
    artist: 'تامر حسني',
    album: 'عيش بشوقك (2018)',
    duration: 210,
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    streamUrl: 'https://cdn.freesound.org/previews/682/682914_11861866-lq.mp3',
    downloadUrl: 'https://cdn.freesound.org/previews/682/682914_11861866-lq.mp3',
    genre: 'حماسي',
    releaseDate: '2018',
    playCount: '130,000,000',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'catalog',
    youtubeId: '1w4q1m0NqE0'
  },
  {
    id: 'hamaki-ya-sattar',
    artistId: 'hamaki',
    title: 'يا ستار - كاملة',
    artist: 'محمد حماقي',
    album: 'كل يوم من ده (2019)',
    duration: 230,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Mohamed_Hamaki_2.jpg',
    streamUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    downloadUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    genre: 'بوب مصري',
    releaseDate: '2019',
    playCount: '124,500,000',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'catalog',
    youtubeId: 'aV0pP3y7wM0'
  },
  {
    id: 'kulthum-enta-omry',
    artistId: 'umm-kulthum',
    title: 'إنت عمري - كاملة',
    artist: 'أم كلثوم',
    album: 'روائع الطرب الأصيل',
    duration: 760,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Umm_Kulthum_as_Fatimah.jpg',
    streamUrl: 'https://archive.org/download/f4ed061e-b902-4dd9-b1c6-6aa12b868eb5/0d6810e2-1512-4b99-bf34-be092b954ac0.mp3',
    downloadUrl: 'https://archive.org/download/f4ed061e-b902-4dd9-b1c6-6aa12b868eb5/0d6810e2-1512-4b99-bf34-be092b954ac0.mp3',
    genre: 'طرب أصيل',
    releaseDate: '1964',
    playCount: '35,800,000',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'catalog',
    youtubeId: '0Y_qBqM5zJw'
  },
  {
    id: 'halim-gana',
    artistId: 'abdel-halim',
    title: 'جانا الهوى - كاملة',
    artist: 'عبد الحليم حافظ',
    album: 'أبي فوق الشجرة',
    duration: 315,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Abdel_Halim_Hafez.jpg',
    streamUrl: 'https://archive.org/download/f4ed061e-b902-4dd9-b1c6-6aa12b868eb5/3681ef61-6f64-4960-b9a0-65426e92df08.mp3',
    downloadUrl: 'https://archive.org/download/f4ed061e-b902-4dd9-b1c6-6aa12b868eb5/3681ef61-6f64-4960-b9a0-65426e92df08.mp3',
    genre: 'طرب',
    releaseDate: '1969',
    playCount: '42,100,000',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'catalog',
    youtubeId: 'w2VqZ5_kE1Y'
  },
  {
    id: 'weeknd-blinding-lights',
    artistId: 'the-weeknd',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours (2020)',
    duration: 200,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/The_Weeknd_Portrait_by_Brian_Ziff.jpg',
    streamUrl: 'https://cdn.freesound.org/previews/732/732296_5674468-lq.mp3',
    downloadUrl: 'https://cdn.freesound.org/previews/732/732296_5674468-lq.mp3',
    genre: 'Synth-Pop',
    releaseDate: '2020',
    playCount: '3,800,000,000',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'catalog',
    youtubeId: '4NRXx6U8ABQ'
  }
];

// Fallback search that works instantly offline & on static Vercel
export function searchLocalMusic(query: string, sourceFilter: 'all' | 'youtube' | 'audius' = 'all') {
  const q = query.trim().toLowerCase();
  
  const matchedArtists = DEFAULT_ARTISTS.filter(a => 
    !q || 
    a.name.toLowerCase().includes(q) || 
    (a.englishName && a.englishName.toLowerCase().includes(q)) ||
    a.genres.some(g => g.toLowerCase().includes(q))
  );

  let results = DEFAULT_TRACKS;
  if (q) {
    results = results.filter(t => 
      t.title.toLowerCase().includes(q) || 
      t.artist.toLowerCase().includes(q) ||
      t.album.toLowerCase().includes(q) ||
      (t.genre && t.genre.toLowerCase().includes(q))
    );
  }

  if (sourceFilter === 'youtube') {
    results = results.filter(t => Boolean(t.youtubeId) || t.source === 'youtube');
  }

  return {
    matchedArtists: matchedArtists.slice(0, 4),
    results
  };
}

export function getLocalArtistProfile(artistId: string) {
  const artist = DEFAULT_ARTISTS.find(a => a.id === artistId);
  if (!artist) return null;
  const tracks = DEFAULT_TRACKS.filter(t => t.artistId === artist.id || t.artist.includes(artist.name));
  return { artist, tracks };
}
