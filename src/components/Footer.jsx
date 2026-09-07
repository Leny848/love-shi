import React from 'react';
import { CONFIG } from '../config';

export function Footer() {
  return (
    <footer className="fixed bottom-3 left-0 right-0 z-10 flex justify-center items-center pointer-events-none">
      <a 
        href={CONFIG.footerUrl}
        target="_blank" 
        rel="noopener noreferrer"
        className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 bg-white/70 backdrop-blur-md border border-pink-200/60 rounded-full text-[11px] font-medium text-pink-700/80 hover:text-pink-900 hover:bg-white transition-all shadow-sm group"
      >
        <svg className="w-3.5 h-3.5 fill-pink-500 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
          <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6zm3 2v8h4V8H5zm6 0v8h8V8h-8z"/>
        </svg>
        <span>{CONFIG.footerText}</span>
      </a>
    </footer>
  );
}
