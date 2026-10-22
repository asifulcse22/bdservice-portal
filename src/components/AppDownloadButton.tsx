import React from 'react';
import { useAppInstall } from './AppInstallContext';

type Variant = 'header' | 'footer' | 'banner' | 'floating';

export default function AppDownloadButton({ variant = 'header' }: { variant?: Variant }) {
  const { openModal, isStandalone } = useAppInstall();
  if (isStandalone) return null;

  const styles: Record<Variant, string> = {
    header:
      'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-700 to-fuchsia-600 hover:scale-105 text-white font-bold text-xs shadow-md transition-transform cursor-pointer shrink-0',
    footer:
      'flex w-full max-w-[260px] items-center justify-center gap-2.5 px-5 py-3 rounded-full bg-gradient-to-r from-purple-700 to-fuchsia-600 text-white font-extrabold text-xs shadow-md active:scale-95 transition-transform cursor-pointer mx-auto md:mx-0',
    banner:
      'inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-md transition cursor-pointer',
    floating:
      'fixed bottom-5 right-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full bg-gradient-to-r from-purple-700 to-fuchsia-600 px-4 py-3 text-xs font-bold text-white shadow-xl active:scale-95 transition-transform cursor-pointer border border-white/20',
  };

  return (
    <button type="button" onClick={openModal} className={styles[variant]}>
      <span className="truncate">📲 অ্যাপ ডাউনলোড (APK / iOS)</span>
    </button>
  );
}