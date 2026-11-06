import React from 'react';
import { WifiOff, Download, ArrowLeft } from 'lucide-react';

interface OfflineBannerProps {
  isOnline: boolean;
  downloadsCount: number;
  onGoToLibrary: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOnline,
  downloadsCount,
  onGoToLibrary,
}) => {
  if (isOnline) return null;

  return (
    <aside 
      aria-label="إشعار وضع عدم الاتصال"
      className="fixed top-16 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 p-3 rounded-2xl bg-amber-950/90 border border-amber-500/40 text-white shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <WifiOff className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-amber-300">أنت في وضع عدم الاتصال</h4>
          <p className="text-[11px] text-zinc-300">
            {downloadsCount > 0 
              ? `لديك ${downloadsCount} أغنية محملة وجاهزة للتشغيل` 
              : 'يمكنك تشغيل أغانيك المحملة في الذاكرة'}
          </p>
        </div>
      </div>

      <button
        onClick={onGoToLibrary}
        className="px-2.5 py-1.5 rounded-xl bg-amber-400 text-zinc-950 text-xs font-extrabold hover:bg-amber-300 flex items-center gap-1 shrink-0 transition-all"
      >
        <span>المكتبة</span>
        <ArrowLeft className="w-3 h-3" />
      </button>
    </aside>
  );
};
