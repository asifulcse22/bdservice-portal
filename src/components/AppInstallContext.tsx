import React, { createContext, useContext, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const APK_URL = '/bd-service-portal.apk';
const APK_DOWNLOAD_NAME = 'bd-service-portal.apk';

interface Ctx {
  openModal: () => void;
  isStandalone: boolean;
}

const AppInstallContext = createContext<Ctx>({ openModal: () => {}, isStandalone: false });

export const useAppInstall = () => useContext(AppInstallContext);

export function AppInstallProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    if (/iphone|ipad|ipod/i.test(window.navigator.userAgent)) {
      setActiveTab('ios');
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstantInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowModal(false);
    }
  };

  return (
    <AppInstallContext.Provider value={{ openModal: () => setShowModal(true), isStandalone }}>
      {children}

      {showModal && !isStandalone && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-700 text-white font-bold">
                  ন
                </div>
                <div>
                  <h3 className="text-base font-bold text-purple-950">নাগরিক সেবা মোবাইল অ্যাপ</h3>
                  <p className="text-xs text-gray-500">Android (.APK) ও iPhone (iOS)</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg px-2.5 py-1 text-sm text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-purple-50 p-1">
              <button
                onClick={() => setActiveTab('android')}
                className={`rounded-lg py-2 text-sm font-semibold transition cursor-pointer ${
                  activeTab === 'android' ? 'bg-purple-700 text-white shadow' : 'text-purple-800'
                }`}
              >
                🤖 Android (APK)
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`rounded-lg py-2 text-sm font-semibold transition cursor-pointer ${
                  activeTab === 'ios' ? 'bg-purple-700 text-white shadow' : 'text-purple-800'
                }`}
              >
                🍎 iPhone (iOS)
              </button> 
            </div>

            {activeTab === 'android' ? (
              <div className="mt-5 space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  অ্যান্ড্রয়েড ফোনে সরাসরি <strong>.apk</strong> ফাইল ডাউনলোড করে ইনস্টল করুন। এরপর অ্যাপের ভেতরেই লগইন ও রেজিস্ট্রেশনসহ সব কাজ করতে পারবেন।
                </p>
                <a
                  href={APK_URL}
                  download={APK_DOWNLOAD_NAME}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-center font-bold text-white shadow-md hover:bg-orange-600 transition"
                >
                  ⬇️ সরাসরি APK ডাউনলোড করুন (.apk)
                </a>
                {deferredPrompt && (
                  <button
                    onClick={handleInstantInstall}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-purple-600 py-3 font-semibold text-purple-700 hover:bg-purple-50 transition cursor-pointer"
                  >
                    ⚡ APK ছাড়াই ১-ক্লিকে ইনস্টল করুন
                  </button>
                )}
                <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600 space-y-1 border border-gray-100">
                  <p>১. ডাউনলোড হওয়া <strong>{APK_DOWNLOAD_NAME}</strong> ফাইলে ট্যাপ করে <strong>Install</strong> করুন।</p>
                  <p>২. "Install Unknown Apps" পারমিশন চাইলে Allow করে দিন।</p>
                  <p>৩. অ্যাপ ওপেন করে আপনার একাউন্টে লগইন বা রেজিস্ট্রেশন করুন।</p>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  iPhone বা iPad ব্যবহারকারীরা অ্যাপ স্টোর ছাড়াই সরাসরি <strong>Safari</strong> ব্রাউজার থেকে এই অ্যাপটি ফোনে ইনস্টল করতে পারবেন:
                </p>
                <ol className="rounded-xl bg-purple-50 p-4 text-sm text-purple-950 space-y-2.5 list-decimal list-inside border border-purple-100">
                  <li>Safari ব্রাউজারের নিচে থাকা <strong>Share (⬆️)</strong> আইকনে ট্যাপ করুন।</li>
                  <li>নিচে স্ক্রল করে <strong>"Add to Home Screen"</strong> অপশনে ট্যাপ করুন।</li>
                  <li>উপরে ডানপাশে <strong>"Add"</strong> বাটনে ক্লিক করলেই হোম স্ক্রিনে <strong>নাগরিক সেবা</strong> অ্যাপ চলে আসবে!</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      )}
    </AppInstallContext.Provider>
  );
}