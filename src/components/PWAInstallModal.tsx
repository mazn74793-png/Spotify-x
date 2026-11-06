import React from 'react';
import { X, Smartphone, Download, Share, PlusSquare, CheckCircle, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-800 p-6 sm:p-7 shadow-2xl space-y-5"
        dir="rtl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand App Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-400 p-[2px] shadow-lg shadow-amber-500/20 shrink-0">
            <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
              <span className="text-2xl">🎵</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">تثبيت تطبيق نغمات ميكس</h3>
            <p className="text-xs text-zinc-400">تطبيق ويب تقدمي (PWA) فائق السرعة</p>
          </div>
        </div>

        {/* Content based on device */}
        {isInstalled ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">التطبيق مثبت بالفعل!</h4>
            <p className="text-xs text-zinc-400">
              أنت تستخدم التطبيق الآن مباشرة من الشاشة الرئيسية لجهازك.
            </p>
          </div>
        ) : isIOS ? (
          /* iOS Safari Step-by-Step Guide */
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              لتثبيت التطبيق على جهاز الآيفون أو الآيباد عبر متصفح سفاري (Safari):
            </p>

            <div className="space-y-2.5">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-200">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <span>1. اضغط على أيقونة <strong>المشاركة (Share)</strong> في أسفل شاشة سفاري.</span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-200">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <span>2. مرر للأسفل واختر <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400">
              بعد الإضافة، سيظهر التطبيق كأيقونة مستقلة تفتح في وضع ملء الشاشة مع حفظ كافة الأغاني أوفلاين.
            </p>
          </div>
        ) : isInstallable ? (
          /* Android / Desktop Instant Install */
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              ثبّت التطبيق على هاتفك أو كمبيوترك بنقرة واحدة لتجربة تشبه التطبيقات الأصلية، بدون متجر وبسرعة فائقة.
            </p>

            <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>تشغيل شاشة كاملة بدون أشرطة المتصفح</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>استماع وتشغيل أوفلاين بدون استهلاك بيانات</span>
              </div>
            </div>

            <button
              onClick={handleInstallClick}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>تثبيت التطبيق الآن</span>
            </button>
          </div>
        ) : (
          /* Fallback when already supported or in standard browser */
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              يمكنك إضافة التطبيق إلى شاشتك الرئيسية عبر الضغط على قائمة المتصفح (⋮) ثم اختيار <strong>تثبيت التطبيق (Install App)</strong> أو <strong>إضافة إلى الشاشة الرئيسية</strong>.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-zinc-800 text-white font-bold text-xs hover:bg-zinc-700"
            >
              حسناً، فهمت
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
