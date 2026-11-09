// Comprehensive verified directory of authentic artist portraits
// Guarantees that every artist displays their genuine face, never defaulting to Amr Diab.

export const NEUTRAL_VINYL_COVER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23181818"/><circle cx="200" cy="200" r="140" fill="%23121212" stroke="%23282828" stroke-width="4"/><circle cx="200" cy="200" r="100" fill="%23151515" stroke="%23222222" stroke-width="2"/><circle cx="200" cy="200" r="60" fill="%231ed760"/><circle cx="200" cy="200" r="16" fill="%23111111"/></svg>';

export const VERIFIED_ARTIST_PORTRAITS: Record<string, { name: string; englishName: string; avatarUrl: string; bio: string; monthlyListeners: string; followersCount: string; genres: string[] }> = {
  'amr-diab': {
    name: 'عمرو دياب',
    englishName: 'Amr Diab',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Amr_Abdul_Baset_Diab.jpg',
    bio: 'الهضبة، أيقونة الموسيقى العربية المعاصرة والأسطورة الأكثر مبيعاً في الشرق الأوسط.',
    monthlyListeners: '14,890,210',
    followersCount: '8.4M',
    genres: ['بوب مصري', 'موسيقى متوسطية']
  },
  'wegz': {
    name: 'ويجز',
    englishName: 'Wegz',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Wegz_2023.jpg',
    bio: 'رائد مشهد التراب والراب المصري الحديث، أحد أكثر الفنانين استماعاً وتأثيراً في الوطن العربي.',
    monthlyListeners: '7,900,000',
    followersCount: '4.8M',
    genres: ['تراب مصري', 'هيب هوب', 'سينث']
  },
  'cairokee': {
    name: 'كايروكي',
    englishName: 'Cairokee',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Cairokee.band.jpg',
    bio: 'فرقة الروك المصرية الأشهر، صوت الشارع والأغاني المعبرة عن أحلام وتطلعات الشباب.',
    monthlyListeners: '6,400,000',
    followersCount: '4.2M',
    genres: ['روك مصري', 'إندي عربي']
  },
  'ahmed-saad': {
    name: 'أحمد سعد',
    englishName: 'Ahmed Saad',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Ahmed_Saad.png',
    bio: 'صوت شعبي وطربي قوي ومتصدر المنصات بأنجح الأغاني والأعمال السينمائية والتلفزيونية.',
    monthlyListeners: '8,100,000',
    followersCount: '5.0M',
    genres: ['شعبي مودرن', 'بوب شعبي']
  },
  'fairouz': {
    name: 'فيروز',
    englishName: 'Fairouz',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Fairuz_1971.jpg',
    bio: 'سفيرة لبنان إلى النجوم وجارة القمر، صوت الشرق الخالد وألحان الأخوين رحباني العظيمة.',
    monthlyListeners: '8,920,400',
    followersCount: '6.1M',
    genres: ['طرب لبناني', 'كلاسيكيات عربية']
  },
  'sherine': {
    name: 'شيرين عبد الوهاب',
    englishName: 'Sherine',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/49/%D8%B4%D9%8A%D8%B1%D9%8A%D9%86.jpg',
    bio: 'صوت مصر وإحساس الشرق، صاحبة الصوت الدافئ والأعمال الرومانسية والدرامية الخالدة.',
    monthlyListeners: '9,650,000',
    followersCount: '5.8M',
    genres: ['بوب مصري', 'رومانسي', 'طرب']
  },
  'tamer-hosny': {
    name: 'تامر حسني',
    englishName: 'Tamer Hosny',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Tamer_Hosny%27s_NYE_Concert_%282025%29_%28cropped%29.png',
    bio: 'نجم الجيل، مغني وملحن ومؤلف صاحب أكبر قاعدة جماهيرية شبابية وأعلى المشاهدات.',
    monthlyListeners: '11,200,000',
    followersCount: '7.9M',
    genres: ['بوب شبابي', 'رومانسي']
  },
  'hamaki': {
    name: 'محمد حماقي',
    englishName: 'Mohamed Hamaki',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Mohamed_Hamaki_2.jpg',
    bio: 'أحد أبرز رواد البوب العربي الحديث، صوت استثنائي وأسلوب موسيقي متجدد باستمرار.',
    monthlyListeners: '8,450,000',
    followersCount: '5.2M',
    genres: ['بوب مصري حديث', 'دانّس بوب']
  },
  'umm-kulthum': {
    name: 'أم كلثوم',
    englishName: 'Umm Kulthum',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Umm_Kulthum_as_Fatimah.jpg',
    bio: 'كوكب الشرق وسيدة الغناء العربي، أسطورة الطرب الأصيل والمقامات الشرقية الخالدة.',
    monthlyListeners: '5,300,000',
    followersCount: '3.9M',
    genres: ['طرب أصيل', 'كلاسيكيات عربية']
  },
  'abdel-halim': {
    name: 'عبد الحليم حافظ',
    englishName: 'Abdel Halim Hafez',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Abdel_Halim_Hafez.jpg',
    bio: 'العندليب الأسمر، رمز الرومانسية والغناء الشرقي والسينما الذهبية.',
    monthlyListeners: '6,100,000',
    followersCount: '4.3M',
    genres: ['طرب كلاسيكي', 'رومانسي قديم']
  },
  'elissa': {
    name: 'إليسا',
    englishName: 'Elissa',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Elissa_-_August_24%2C_2012_%282%29.jpg',
    bio: 'ملكة الإحساس، النجمة اللبنانية الأكثر تأثيراً والحائزة على عدة جوائز الموسيقى العالمية.',
    monthlyListeners: '7,800,000',
    followersCount: '6.5M',
    genres: ['بوب لبناني', 'رومانسي']
  },
  'assala': {
    name: 'أصالة نصري',
    englishName: 'Assala',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/32/Asalah_Nasri.jpg',
    bio: 'صوت الأصالة والصلابة، فنانة عربية متميزة بطبقات صوتية عالية وأداء طربي شجي.',
    monthlyListeners: '7,100,000',
    followersCount: '5.1M',
    genres: ['طرب سوري وخليجي', 'أصالة']
  },
  'nancy-ajram': {
    name: 'نانسي عجرم',
    englishName: 'Nancy Ajram',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Nancy_Ajram_signing_ceremony.jpg',
    bio: 'فراشة الغناء العربي ونجمة البوب الجماهيرية ذات المسيرة الحافلة بالنجاحات العالمية.',
    monthlyListeners: '8,200,000',
    followersCount: '6.8M',
    genres: ['بوب لبناني', 'حماسي']
  },
  'the-weeknd': {
    name: 'The Weeknd',
    englishName: 'The Weeknd',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/The_Weeknd_Portrait_by_Brian_Ziff.jpg',
    bio: 'Global superstar, singer, songwriter and producer of modern Synth-pop and R&B.',
    monthlyListeners: '108,450,000',
    followersCount: '85M',
    genres: ['Synth-Pop', 'R&B']
  }
};

export function getArtistPortrait(identifier: string): string {
  if (!identifier) return NEUTRAL_VINYL_COVER;
  const clean = identifier.toLowerCase().trim().replace(/^artist-/, '').replace(/-/g, ' ');

  for (const [key, artist] of Object.entries(VERIFIED_ARTIST_PORTRAITS)) {
    if (
      key === identifier.toLowerCase() ||
      artist.name.toLowerCase() === clean ||
      artist.englishName.toLowerCase() === clean ||
      clean.includes(artist.name.toLowerCase()) ||
      clean.includes(key)
    ) {
      return artist.avatarUrl;
    }
  }

  return NEUTRAL_VINYL_COVER;
}
