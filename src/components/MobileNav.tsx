import React from 'react';
import { ActiveTab } from '../types/music';
import { Home, Search, Library, HelpCircle } from 'lucide-react';

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  downloadsCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  downloadsCount
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#121212]/95 backdrop-blur-2xl border-t border-white/5 px-4 py-2 flex items-center justify-around shadow-2xl safe-area-pb">
      <button
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center gap-1 transition-all ${
          activeTab === 'home' ? 'text-[#1ed760] font-bold' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px]">الرئيسية</span>
      </button>

      <button
        onClick={() => setActiveTab('search')}
        className={`flex flex-col items-center gap-1 transition-all ${
          activeTab === 'search' ? 'text-[#1ed760] font-bold' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <Search className="w-5 h-5" />
        <span className="text-[10px]">البحث</span>
      </button>

      <button
        onClick={() => setActiveTab('library')}
        className={`flex flex-col items-center gap-1 transition-all relative ${
          activeTab === 'library' ? 'text-[#1ed760] font-bold' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <div className="relative">
          <Library className="w-5 h-5" />
          {downloadsCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-[#1ed760] text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {downloadsCount}
            </span>
          )}
        </div>
        <span className="text-[10px]">المكتبة</span>
      </button>

      <button
        onClick={() => setActiveTab('docs')}
        className={`flex flex-col items-center gap-1 transition-all ${
          activeTab === 'docs' ? 'text-[#1ed760] font-bold' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <HelpCircle className="w-5 h-5" />
        <span className="text-[10px]">الاستضافة</span>
      </button>
    </nav>
  );
};
