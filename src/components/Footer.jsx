import React from 'react';
import { CONFIG } from '../config';

export function Footer() {
  return (
    <footer className="fixed bottom-4 left-0 right-0 z-20 flex justify-center items-center pointer-events-none">
      <div className="pointer-events-auto inline-flex items-center gap-2 px-3.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[11px] font-medium text-slate-400 shadow-lg">
        <span className="font-serif font-bold text-amber-400/90 tracking-wide">{CONFIG.appName}</span>
        <span className="text-slate-600">•</span>
        <span className="text-slate-400/90 italic font-serif text-[10px]">{CONFIG.footerText}</span>
      </div>
    </footer>
  );
}
