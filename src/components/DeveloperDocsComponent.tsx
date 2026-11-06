import React, { useState } from 'react';
import { 
  Terminal, 
  FolderTree, 
  Database, 
  Copy, 
  Check, 
  Layers, 
  ShieldCheck,
  Server,
  KeyRound,
  ExternalLink,
  HelpCircle,
  Cloud
} from 'lucide-react';

export const DeveloperDocsComponent: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'hosting' | 'quickstart' | 'structure' | 'indexeddb'>('hosting');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 pb-32">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          دليل التشغيل والاستضافة
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          إرشادات نشر المشروع على Vercel و Render وكيفية العمل بدون أي مفاتيح API
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveSection('hosting')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeSection === 'hosting'
              ? 'bg-white text-black'
              : 'bg-[#181818] hover:bg-[#282828] text-zinc-300'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>الاستضافة على Vercel و Render</span>
        </button>

        <button
          onClick={() => setActiveSection('quickstart')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeSection === 'quickstart'
              ? 'bg-white text-black'
              : 'bg-[#181818] hover:bg-[#282828] text-zinc-300'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>التشغيل المحلي</span>
        </button>

        <button
          onClick={() => setActiveSection('structure')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeSection === 'structure'
              ? 'bg-white text-black'
              : 'bg-[#181818] hover:bg-[#282828] text-zinc-300'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>هيكل الملفات</span>
        </button>

        <button
          onClick={() => setActiveSection('indexeddb')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeSection === 'indexeddb'
              ? 'bg-white text-black'
              : 'bg-[#181818] hover:bg-[#282828] text-zinc-300'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>نظام الذاكرة الأوفلاين</span>
        </button>
      </div>

      {/* 1. Hosting Section (Direct Answer to User) */}
      {activeSection === 'hosting' && (
        <div className="space-y-6">
          {/* Key takeaway cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* API Keys Card */}
            <div className="p-5 rounded-2xl bg-[#181818] border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-[#1ed760] font-bold text-sm">
                <KeyRound className="w-5 h-5" />
                <span>هل تحتاج إلى مفاتيح API Keys؟</span>
              </div>
              <p className="text-2xl font-black text-white">
                لا، لا يحتاج أي مفاتيح نهائياً!
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                التطبيق يعتمد بالكامل على مصادر موسيقية مفتوحة ومجانية (Open Audius API و Internet Archive و IndexedDB داخل المتصفح). لن تحتاج لدفع سنت واحد أو تسجيل بطاقة ائتمانية.
              </p>
            </div>

            {/* Platform Card */}
            <div className="p-5 rounded-2xl bg-[#181818] border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                <Server className="w-5 h-5" />
                <span>أين تستضيف المشروع؟</span>
              </div>
              <p className="text-2xl font-black text-white">
                Render.com أو Vercel
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                الخيار الأسهل والأمثل للتطبيقات التي تحتوي على خادم Node.js / Express هو <strong>Render.com</strong> أو <strong>Railway</strong> (مجاني بنقرة واحدة)، كما يدعم <strong>Vercel</strong> عبر ملف <code className="text-zinc-200">vercel.json</code> الموجود بالمشروع.
              </p>
            </div>
          </div>

          {/* Option A: Render.com (Recommended for Full-Stack Node/Express) */}
          <div className="p-6 rounded-2xl bg-[#181818] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#1ed760] text-black text-xs font-black flex items-center justify-center">1</span>
                <span>الاستضافة على Render.com (الخيار الأسهل والأسرع - مجاناً)</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1ed760]/10 text-[#1ed760] border border-[#1ed760]/20">
                موصى به لـ Express
              </span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              لأن تطبيقنا يحتوي على خادم Express (<code className="text-white bg-black/40 px-1.5 py-0.5 rounded">server.ts</code>) لمعالجة البروكسي وبث الصوت بدون مشاكل CORS، فإن استضافته كـ <strong>Web Service</strong> على منصة مثل Render أو Railway هي الخيار الأسهل:
            </p>

            <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-zinc-300">
              <li>ارفع كود المشروع إلى مستودع على <strong>GitHub</strong>.</li>
              <li>ادخل إلى موقع <a href="https://render.com" target="_blank" rel="noreferrer" className="text-[#1ed760] underline">render.com</a> واختر <strong>New &gt; Web Service</strong>.</li>
              <li>اربط مستودع الـ GitHub الخاص بك، ثم اضبط الإعدادات التالية:
                <div className="mt-2 space-y-1.5 font-mono text-xs p-3 rounded-xl bg-black/50 border border-white/5 text-zinc-200">
                  <div><strong>Build Command:</strong> <code className="text-[#1ed760]">npm install && npm run build</code></div>
                  <div><strong>Start Command:</strong> <code className="text-[#1ed760]">npm start</code></div>
                  <div><strong>Node Version:</strong> 18 أو 20</div>
                </div>
              </li>
              <li>اضغط <strong>Deploy Web Service</strong>. سيعمل التطبيق خلال دقيقتين مع رابط HTTPS مجاني ودعم كامل للـ PWA والتحميل!</li>
            </ol>
          </div>

          {/* Option B: Vercel */}
          <div className="p-6 rounded-2xl bg-[#181818] border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-black flex items-center justify-center">2</span>
              <span>الاستضافة على Vercel</span>
            </h3>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              إذا كنت تفضل <strong>Vercel</strong>، فقد تم تضمين ملف الإعداد <code className="text-white bg-black/40 px-1.5 py-0.5 rounded">vercel.json</code> في جذر المشروع:
            </p>

            <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-zinc-300">
              <li>ارفع المشروع إلى GitHub.</li>
              <li>في لوحة تحكم <strong>Vercel</strong>، اضغط <strong>Add New &gt; Project</strong> واختر المستودع.</li>
              <li>الإعدادات الافتراضية تكفي، اضغط <strong>Deploy</strong> مباشرة.</li>
              <li><strong>ملاحظة هامة:</strong> Vercel هي منصة Serverless للواجهات الأمامية؛ لذلك تم تكوين الـ Build ليخرج حزمة الإنتاج داخل مجلد <code className="text-white">dist</code> مع دعم التوجيه للـ SPA.</li>
            </ol>
          </div>
        </div>
      )}

      {/* 2. Quickstart Section */}
      {activeSection === 'quickstart' && (
        <div className="p-6 rounded-2xl bg-[#181818] border border-white/5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#1ed760]" />
            <span>التشغيل المحلي في جهازك</span>
          </h3>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-zinc-400 mb-1">1. تثبيت الاعتماديات:</p>
              <pre className="p-3 rounded-xl bg-black/60 text-[#1ed760] font-mono text-xs">npm install</pre>
            </div>
            <div>
              <p className="text-xs text-zinc-400 mb-1">2. تشغيل بيئة التطوير:</p>
              <pre className="p-3 rounded-xl bg-black/60 text-white font-mono text-xs">npm run dev</pre>
            </div>
            <div>
              <p className="text-xs text-zinc-400 mb-1">3. بناء الإنتاج والتشغيل النهائي:</p>
              <pre className="p-3 rounded-xl bg-black/60 text-zinc-300 font-mono text-xs">npm run build && npm start</pre>
            </div>
          </div>
        </div>
      )}

      {/* 3. Structure */}
      {activeSection === 'structure' && (
        <div className="p-6 rounded-2xl bg-[#181818] border border-white/5 space-y-3">
          <h3 className="text-base font-bold text-white">الهيكل المنظم للمشروع</h3>
          <pre className="p-4 rounded-xl bg-black/60 text-zinc-300 font-mono text-xs overflow-x-auto leading-relaxed">
{`├── public/
│   ├── manifest.json       # تعريف الـ PWA للتثبيت على الهواتف
│   ├── sw.js               # Service Worker للعمل أوفلاين
│   ├── icon-192.png        # أيقونة الهواتف
│   └── icon-512.png        # أيقونة الشاشات العالية
├── src/
│   ├── components/
│   │   ├── Header.tsx      # الشريط العلوي
│   │   ├── MobileNav.tsx   # الشريط السفلي للموبايل
│   │   ├── SearchComponent.tsx # البحث والفنانون
│   │   ├── PlayerComponent.tsx # المشغل الثابت وشاشة التوسيع
│   │   ├── LibraryComponent.tsx# المكتبة والمتابعون والأوفلاين
│   │   ├── HomeComponent.tsx   # الرئيسية على طراز Spotify
│   │   ├── ArtistProfileModal.tsx # بروفايل الفنان الكامل
│   │   └── PWAInstallModal.tsx # التثبيت على iOS وأندرويد
│   ├── hooks/
│   ├── services/
│   │   └── db.ts           # IndexedDB لتخزين الصوت أوفلاين
│   ├── App.tsx
│   └── main.tsx
├── server.ts               # خادم Express والبحث والبروكسي
└── vercel.json             # إعدادات النشر على Vercel`}
          </pre>
        </div>
      )}

      {/* 4. IndexedDB */}
      {activeSection === 'indexeddb' && (
        <div className="p-6 rounded-2xl bg-[#181818] border border-white/5 space-y-3">
          <h3 className="text-base font-bold text-white">كيف يعمل التحميل والتشغيل أوفلاين؟</h3>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            عند الضغط على "تحميل"، يقوم التطبيق بجلب ملف الصوت وتخزينه كـ Binary Blob داخل قاعدة بيانات المتصفح IndexedDB تحت مخزن <code className="text-[#1ed760]">downloaded_tracks</code>.
          </p>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            عند تشغيل الأغنية لاحقاً بدون اتصال بالإنترنت، يتم تحويل الـ Blob إلى رابط تشغيل محلي فوري عبر <code className="text-[#1ed760]">URL.createObjectURL(blob)</code>، ليعمل المشغل دون الحاجة لأي اتصال بالشبكة.
          </p>
        </div>
      )}
    </div>
  );
};
