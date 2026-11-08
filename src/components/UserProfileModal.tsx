import React, { useState } from 'react';
import { UserProfile } from '../types/music';
import { saveUserProfile } from '../services/authService';
import { 
  X, 
  User, 
  Crown, 
  Clock, 
  Heart, 
  Users, 
  Download, 
  Sliders, 
  Volume2, 
  Radio, 
  Check, 
  Trash2,
  Sparkles,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  favoritesCount: number;
  followedCount: number;
  downloadsCount: number;
  storageUsedText: string;
  onClearStorage: () => void;
}

const AVATAR_OPTIONS = [
  'https://upload.wikimedia.org/wikipedia/commons/6/66/Amr_Abdul_Baset_Diab.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/4/42/Wegz_2023.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/1/14/Fairuz_1971.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/f/fa/Cairokee.band.jpg'
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  favoritesCount,
  followedCount,
  downloadsCount,
  storageUsedText,
  onClearStorage
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(userProfile.name);
  const [emailInput, setEmailInput] = useState(userProfile.email);
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile.avatarUrl);
  const [activeTab, setActiveTab] = useState<'profile' | 'audio' | 'storage'>('profile');

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveUserProfile({
      name: nameInput.trim() || userProfile.name,
      email: emailInput.trim() || userProfile.email,
      avatarUrl: selectedAvatar
    });
    setIsEditing(false);
  };

  const handleAudioQualityChange = (quality: '320k' | '256k' | '160k') => {
    saveUserProfile({ audioQuality: quality });
  };

  const handleEqualizerChange = (preset: 'balanced' | 'bass' | 'tarab' | 'vocal' | 'relax') => {
    saveUserProfile({ equalizerPreset: preset });
  };

  const handleToggleBackgroundPlay = () => {
    saveUserProfile({ backgroundPlayEnabled: !userProfile.backgroundPlayEnabled });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#181818] border border-white/10 p-5 sm:p-7 shadow-2xl space-y-6"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & User Summary */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 pt-2">
          <div className="relative group shrink-0">
            <img 
              src={userProfile.avatarUrl} 
              alt={userProfile.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#1ed760] shadow-lg shadow-green-500/10"
            />
            {userProfile.isVip && (
              <div 
                title="عضوية ذهبية VIP"
                className="absolute -bottom-1 -left-1 bg-amber-400 text-black p-1 rounded-full shadow"
              >
                <Crown className="w-3.5 h-3.5 fill-black" />
              </div>
            )}
          </div>

          <div className="text-center sm:text-right flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white truncate">
                {userProfile.name}
              </h2>
              {userProfile.isVip && (
                <span className="bg-[#1ed760]/15 text-[#1ed760] text-[11px] font-bold px-2 py-0.5 rounded-full border border-[#1ed760]/30 inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  حساب مميز
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-400 mt-1 truncate">
              {userProfile.email}
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-zinc-300">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-[#1ed760] hover:underline font-bold"
              >
                {isEditing ? 'إلغاء التعديل' : 'تعديل الملف الشخصي'}
              </button>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400">عضو منذ {userProfile.memberSince}</span>
            </div>
          </div>
        </div>

        {/* Edit Form (Collapsible) */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="bg-[#242424] p-4 rounded-2xl border border-white/5 space-y-4">
            <h4 className="text-xs font-bold text-white">تخصيص البيانات والصورة</h4>
            
            <div className="space-y-1.5">
              <label className="text-[11px] text-zinc-400">اسم المستخدم</label>
              <input 
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1ed760]"
                placeholder="أدخل اسمك"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-zinc-400">البريد الإلكتروني</label>
              <input 
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1ed760]"
                placeholder="example@mail.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-zinc-400">اختر صورة الحساب</label>
              <div className="flex items-center gap-2.5">
                {AVATAR_OPTIONS.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedAvatar(img)}
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                      selectedAvatar === img ? 'border-[#1ed760] scale-110 shadow' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Avatar option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-xl text-xs font-bold bg-[#1ed760] text-black hover:bg-emerald-400 transition-colors shadow"
              >
                حفظ التعديلات
              </button>
            </div>
          </form>
        )}

        {/* Tab Selection */}
        <div className="flex items-center gap-1 bg-[#242424] p-1 rounded-2xl border border-white/5">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            إحصائياتي
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'audio'
                ? 'bg-white text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            إعدادات الصوت والمشغل
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'storage'
                ? 'bg-white text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            التخزين والتحميلات
          </button>
        </div>

        {/* Tab 1: Profile & Listening Stats */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-[#242424] p-3.5 rounded-2xl border border-white/5 text-center">
                <Clock className="w-5 h-5 text-[#1ed760] mx-auto mb-1.5" />
                <p className="text-base font-black text-white">{userProfile.totalListeningMinutes} دقيقة</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">وقت الاستماع</p>
              </div>

              <div className="bg-[#242424] p-3.5 rounded-2xl border border-white/5 text-center">
                <Heart className="w-5 h-5 text-rose-500 mx-auto mb-1.5" />
                <p className="text-base font-black text-white">{favoritesCount}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">أغنية مفضلة</p>
              </div>

              <div className="bg-[#242424] p-3.5 rounded-2xl border border-white/5 text-center">
                <Users className="w-5 h-5 text-sky-400 mx-auto mb-1.5" />
                <p className="text-base font-black text-white">{followedCount}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">فنان أتابعه</p>
              </div>

              <div className="bg-[#242424] p-3.5 rounded-2xl border border-white/5 text-center">
                <Download className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
                <p className="text-base font-black text-white">{downloadsCount}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">مقطع أوفلاين</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-950/40 to-[#181818] p-4 rounded-2xl border border-[#1ed760]/20 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#1ed760]" />
                  ميزات العضوية المميزة VIP مفعلة
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  تحميل أوفلاين بلا حدود، استماع في الخلفية مع إغلاق الشاشة، وجودة استوديو 320kbps.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Audio & Background Playback */}
        {activeTab === 'audio' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Background Play Toggle */}
            <div className="bg-[#242424] p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#1ed760]" />
                  <h4 className="text-sm font-bold text-white">التشغيل في الخلفية عند قفل الشاشة</h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  يضمن استمرار سماع الموسيقى عند إطفاء شاشة الهاتف أو الخروج من المتصفح والتحكم عبر شاشة القفل.
                </p>
              </div>

              <button
                onClick={handleToggleBackgroundPlay}
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                  userProfile.backgroundPlayEnabled ? 'bg-[#1ed760]' : 'bg-zinc-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-black transition-transform ${
                  userProfile.backgroundPlayEnabled ? 'translate-x-0' : '-translate-x-6'
                }`} />
              </button>
            </div>

            {/* Audio Streaming Quality */}
            <div className="bg-[#242424] p-4 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">جودة البث والاستماع</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: '320k', label: 'عالي جداً 320 kbps', desc: 'نقاء صوت استوديو فائق' },
                  { id: '256k', label: 'عالي 256 kbps', desc: 'توازن ممتاز بين الدقة والسرعة' },
                  { id: '160k', label: 'قياسي 160 kbps', desc: 'توفير حزمة وبيانات الهاتف' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleAudioQualityChange(item.id as any)}
                    className={`p-3 rounded-xl border text-right transition-all ${
                      userProfile.audioQuality === item.id
                        ? 'bg-[#1ed760]/10 border-[#1ed760] text-white'
                        : 'bg-[#181818] border-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{item.label}</span>
                      {userProfile.audioQuality === item.id && (
                        <Check className="w-3.5 h-3.5 text-[#1ed760]" />
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Equalizer Presets */}
            <div className="bg-[#242424] p-4 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">موازن الصوت الذكي (Equalizer)</h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'tarab', label: 'طرب ووضوح نغمات' },
                  { id: 'bass', label: 'بيس مضخم وقوي' },
                  { id: 'balanced', label: 'متوازن قياسي' },
                  { id: 'vocal', label: 'نقاء الأصوات والكلام' },
                  { id: 'relax', label: 'هادئ ومريح' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleEqualizerChange(item.id as any)}
                    className={`px-3 py-2 rounded-xl border text-right text-xs font-bold transition-all flex items-center justify-between ${
                      userProfile.equalizerPreset === item.id
                        ? 'bg-amber-400/10 border-amber-400 text-amber-300'
                        : 'bg-[#181818] border-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    {userProfile.equalizerPreset === item.id && (
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Storage & Offline Downloads */}
        {activeTab === 'storage' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-[#242424] p-4 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">المساحة المستخدمة للأغاني المحملة</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    جميع الملفات مخزنة محلياً في جهازك بدون استهلاك للإنترنت.
                  </p>
                </div>
                <span className="text-sm font-black text-[#1ed760]">{storageUsedText}</span>
              </div>

              <div className="w-full bg-[#181818] rounded-full h-2.5 overflow-hidden">
                <div className="bg-[#1ed760] h-full rounded-full w-1/5" />
              </div>

              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-zinc-400">{downloadsCount} أغنية محملة أوفلاين</span>
                <button
                  onClick={onClearStorage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 text-red-400 hover:bg-red-900/60 border border-red-800/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>تفريغ الذاكرة المؤقتة</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
