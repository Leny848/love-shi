import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { toggleSound, isSoundEnabled, playPop } from '../utils/sound';

export function SoundToggle() {
  const [enabled, setEnabled] = useState(isSoundEnabled());

  const handleToggle = () => {
    const newState = toggleSound();
    setEnabled(newState);
    if (newState) {
      playPop();
    }
  };

  return (
    <div className="fixed top-4 right-4 z-40">
      <button
        type="button"
        onClick={handleToggle}
        title={enabled ? "Mute cute sound effects" : "Enable cute sound effects"}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 hover:bg-white backdrop-blur-md border border-pink-200/80 rounded-full text-xs font-semibold text-rose-600 shadow-sm hover:shadow transition-all cursor-pointer select-none active:scale-95"
      >
        {enabled ? (
          <>
            <Volume2 className="w-4 h-4 text-rose-500 animate-pulse" />
            <span className="hidden sm:inline">Sounds ON</span>
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline text-slate-500">Muted</span>
          </>
        )}
      </button>
    </div>
  );
}
