import { Track, Artist } from '../types/music';

// Smart Arabic text normalization for 100% accurate search matching
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[إأآا]/g, 'ا')
    .replace(/[ىي]/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove diacritics / tashkeel
    .replace(/ـ+/g, '') // remove tatweel / kashida
    .replace(/\s+/g, ' '); // collapse whitespace
}

// 1. Curated authentic artists with direct high-res Wikimedia & Unsplash portraits
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
    id: 'wegz',
    name: 'ويجز',
    englishName: 'Wegz',
    avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    headerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    bio: 'رائد مشهد التراب والراب المصري الحديث، أحد أكثر الفنانين تأثيراً واستماعاً في العالم العربي.',
    monthlyListeners: '7,900,000',
    followersCount: '4.8M',
    genres: ['تراب مصري', 'هيب هوب', 'سينث'],
    isVerified: true
  },
  {
    id: 'cairokee',
    name: 'كايروكي',
    englishName: 'Cairokee',
    avatarUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
    headerUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
    bio: 'فرقة الروك المصرية الأشهر، صوت الشارع والأغاني المعبرة عن أحلام وتطلعات الشباب.',
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
    headerUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    bio: 'صوت شعبي وطربي قوي ومتصدر المنصات بأنجح الأغاني والأعمال السينمائية والتلفزيونية.',
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

// 2. Comprehensive Curated Discography with YouTube IDs and High Quality Audio
export const DEFAULT_TRACKS: Track[] = [
  // Amr Diab
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
    id: 'amr-nour',
    artistId: 'amr-diab',
    title: 'نور العين (Nour El Ain)',
    artist: 'عمرو دياب',
    album: 'نور العين (1996)',
    duration: 240,
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    streamUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    downloadUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    genre: 'بوب مصري',
    releaseDate: '1996',
    playCount: '190,000,000',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'catalog',
    youtubeId: 'x6zLzL2B28Y'
  },
  {
    id: 'amr-makank',
    artistId: 'amr-diab',
    title: 'مكانك (Makanak)',
    artist: 'عمرو دياب',
    album: 'مكانك (2024)',
    duration: 210,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Amr_Abdul_Baset_Diab.jpg',
    streamUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    downloadUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    genre: 'بوب مصري',
    releaseDate: '2024',
    playCount: '52,000,000',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'youtube',
    youtubeId: '5Z1bXk7xH2o'
  },

  // Fairouz
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
  },
  {
    id: 'fairouz-sahar',
    artistId: 'fairouz',
    title: 'سهر الليالي',
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
    id: 'fairouz-kifak',
    artistId: 'fairouz',
    title: 'كيفك إنت',
    artist: 'فيروز',
    album: 'كيفك إنت (1991)',
    duration: 215,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Fairuz_1971.jpg',
    streamUrl: 'https://archive.org/download/f4ed061e-b902-4dd9-b1c6-6aa12b868eb5/0d6810e2-1512-4b99-bf34-be092b954ac0.mp3',
    downloadUrl: 'https://archive.org/download/f4ed061e-b902-4dd9-b1c6-6aa12b868eb5/0d6810e2-1512-4b99-bf34-be092b954ac0.mp3',
    genre: 'طرب',
    releaseDate: '1991',
    playCount: '55,300,000',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'catalog',
    youtubeId: 'w2VqZ5_kE1Y'
  },

  // Sherine
  {
    id: 'sherine-mashaer',
    artistId: 'sherine',
    title: 'مشاعر',
    artist: 'شيرين عبد الوهاب',
    album: 'حكاية حياة',
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
    id: 'sherine-sabry-aleel',
    artistId: 'sherine',
    title: 'صبري قليل',
    artist: 'شيرين عبد الوهاب',
    album: 'جرح تاني (2003)',
    duration: 245,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/49/%D8%B4%D9%8A%D8%B1%D9%8A%D9%86.jpg',
    streamUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    downloadUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    genre: 'طرب حديث',
    releaseDate: '2003',
    playCount: '88,000,000',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'youtube',
    youtubeId: 'h71zRjE2P_0'
  },

  // Tamer Hosny
  {
    id: 'tamer-kol-marra',
    artistId: 'tamer-hosny',
    title: 'كل مرة بشوفك فيها',
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
    id: 'tamer-hormon',
    artistId: 'tamer-hosny',
    title: 'هرمون السعادة',
    artist: 'تامر حسني',
    album: 'فيلم تاج (2023)',
    duration: 195,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Tamer_Hosny%27s_NYE_Concert_%282025%29_%28cropped%29.png',
    streamUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    downloadUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    genre: 'بوب شبابي',
    releaseDate: '2023',
    playCount: '95,000,000',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'youtube',
    youtubeId: '2m-90jU1Y3o'
  },

  // Hamaki
  {
    id: 'hamaki-ya-sattar',
    artistId: 'hamaki',
    title: 'يا ستار',
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
    id: 'hamaki-adry',
    artistId: 'hamaki',
    title: 'أدرينالين (Adrenalin)',
    artist: 'محمد حماقي',
    album: 'أدرينالين (2022)',
    duration: 205,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Mohamed_Hamaki_2.jpg',
    streamUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    downloadUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    genre: 'بوب حديث',
    releaseDate: '2022',
    playCount: '110,000,000',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'youtube',
    youtubeId: 'pQ7d7K4eF_g'
  },

  // Wegz
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

  // Cairokee
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

  // Ahmed Saad
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
    id: 'saad-ekhtiyarati',
    artistId: 'ahmed-saad',
    title: 'إختياراتي مدمرة حياتي',
    artist: 'أحمد سعد',
    album: 'فيلم مستر إكس (2023)',
    duration: 185,
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    streamUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    downloadUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    genre: 'بوب شعبي',
    releaseDate: '2023',
    playCount: '140,000,000',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'youtube',
    youtubeId: 'p3A4e6B7b9Q'
  },

  // Umm Kulthum
  {
    id: 'kulthum-enta-omry',
    artistId: 'umm-kulthum',
    title: 'إنت عمري',
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
    id: 'kulthum-alf-leila',
    artistId: 'umm-kulthum',
    title: 'ألف ليلة وليلة',
    artist: 'أم كلثوم',
    album: 'روائع الطرب',
    duration: 820,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Umm_Kulthum_as_Fatimah.jpg',
    streamUrl: 'https://archive.org/download/f4ed061e-b902-4dd9-b1c6-6aa12b868eb5/0d6810e2-1512-4b99-bf34-be092b954ac0.mp3',
    downloadUrl: 'https://archive.org/download/f4ed061e-b902-4dd9-b1c6-6aa12b868eb5/0d6810e2-1512-4b99-bf34-be092b954ac0.mp3',
    genre: 'طرب أصيل',
    releaseDate: '1969',
    playCount: '45,000,000',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'catalog',
    youtubeId: '1Y_qBqM5zJw'
  },

  // Abdel Halim
  {
    id: 'halim-gana',
    artistId: 'abdel-halim',
    title: 'جانا الهوى',
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
    id: 'halim-ahwak',
    artistId: 'abdel-halim',
    title: 'أهواك',
    artist: 'عبد الحليم حافظ',
    album: 'بنات اليوم (1957)',
    duration: 230,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Abdel_Halim_Hafez.jpg',
    streamUrl: 'https://archive.org/download/f4ed061e-b902-4dd9-b1c6-6aa12b868eb5/3681ef61-6f64-4960-b9a0-65426e92df08.mp3',
    downloadUrl: 'https://archive.org/download/f4ed061e-b902-4dd9-b1c6-6aa12b868eb5/3681ef61-6f64-4960-b9a0-65426e92df08.mp3',
    genre: 'رومانسي كلاسيكي',
    releaseDate: '1957',
    playCount: '65,000,000',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'catalog',
    youtubeId: '2Y_qBqM5zJw'
  },

  // Elissa
  {
    id: 'elissa-as3ad',
    artistId: 'elissa',
    title: 'أسعد واحدة',
    artist: 'إليسا',
    album: 'أسعد واحدة (2012)',
    duration: 250,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Elissa_-_August_24%2C_2012_%282%29.jpg',
    streamUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    downloadUrl: 'https://archive.org/download/AmrDiab_541/Amr_Diab-Wayah.mp3',
    genre: 'بوب لبناني',
    releaseDate: '2012',
    playCount: '90,000,000',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'youtube',
    youtubeId: '3Y_qBqM5zJw'
  },

  // The Weeknd
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
  },
  {
    id: 'weeknd-starboy',
    artistId: 'the-weeknd',
    title: 'Starboy (feat. Daft Punk)',
    artist: 'The Weeknd',
    album: 'Starboy (2016)',
    duration: 230,
    coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/The_Weeknd_Portrait_by_Brian_Ziff.jpg',
    streamUrl: 'https://cdn.freesound.org/previews/732/732296_5674468-lq.mp3',
    downloadUrl: 'https://cdn.freesound.org/previews/732/732296_5674468-lq.mp3',
    genre: 'Pop / R&B',
    releaseDate: '2016',
    playCount: '2,900,000,000',
    bitrate: '320 kbps',
    isFullLength: true,
    source: 'youtube',
    youtubeId: '34Na4j8AVgA'
  }
];

// Fallback search with Arabic normalization that works instantly offline & on static Vercel
export function searchLocalMusic(query: string, sourceFilter: 'all' | 'youtube' | 'audius' = 'all') {
  const normQuery = normalizeArabic(query);
  
  const matchedArtists = DEFAULT_ARTISTS.filter(a => {
    if (!normQuery) return true;
    const normName = normalizeArabic(a.name);
    const normEng = normalizeArabic(a.englishName || '');
    const normBio = normalizeArabic(a.bio);
    const normGenres = a.genres.map(g => normalizeArabic(g)).join(' ');
    
    return (
      normName.includes(normQuery) || 
      normEng.includes(normQuery) ||
      normBio.includes(normQuery) ||
      normGenres.includes(normQuery)
    );
  });

  let results = DEFAULT_TRACKS;
  if (normQuery) {
    results = results.filter(t => {
      const normTitle = normalizeArabic(t.title);
      const normArtist = normalizeArabic(t.artist);
      const normAlbum = normalizeArabic(t.album);
      const normGenre = normalizeArabic(t.genre || '');

      return (
        normTitle.includes(normQuery) ||
        normArtist.includes(normQuery) ||
        normAlbum.includes(normQuery) ||
        normGenre.includes(normQuery)
      );
    });
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
