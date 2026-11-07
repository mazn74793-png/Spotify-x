import React from 'react';
import { ActiveTab } from '../types/music';
import { 
  Home, 
  Search, 
  Library, 
  Wifi, 
  WifiOff, 
  Smartphone,
  HelpCircle
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOnline: boolean;
  downloadsCount: number;
  onOpenInstallModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isOnline,
  downloadsCount,
  onOpenInstallModal
}) => {
  const { isInstalled } = usePWAInstall();

  return (
    <header className="sticky top-0 z-40 bg-[#121212]/85 backdrop-blur-2xl border-b border-white/5 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name (Spotify aesthetic) */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-full bg-[#1ed760] flex items-center justify-center text-black font-black shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform">
            <Library className="w-4 h-4 text-black fill-black" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-[#1ed760] transition-colors">
                نغمات
              </span>
            </div>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#242424] p-1 rounded-full border border-white/5">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'home'
                ? 'bg-white text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>الرئيسية</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'search'
                ? 'bg-white text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>البحث والفنانون</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all relative ${
              activeTab === 'library'
                ? 'bg-white text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Library className="w-4 h-4" />
            <span>المكتبة</span>
            {downloadsCount > 0 && (
              <span className="text-[10px] bg-[#1ed760] text-black px-1.5 py-0.2 rounded-full font-black">
                {downloadsCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right side: Online Status & PWA Install */}
        <div className="flex items-center gap-2.5">
          <div 
            title={isOnline ? 'متصل بالإنترنت' : 'وضع غير متصل'}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              isOnline 
                ? 'text-zinc-400 bg-white/5' 
                : 'bg-amber-950/60 text-amber-300 border border-amber-800 animate-pulse'
            }`}
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#1ed760]" />
                <span className="hidden sm:inline">متصل</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>أوفلاين</span>
              </>
            )}
          </div>

          {!isInstalled && (
            <button
              onClick={onOpenInstallModal}
              className="px-4 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-all active:scale-95 shadow"
            >
              تثبيت التطبيق
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
