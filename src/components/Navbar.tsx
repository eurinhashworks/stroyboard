import React from 'react';
import { Clapperboard, Sparkles, Download, RefreshCw, Film } from 'lucide-react';
import { Storyboard } from '../types';

interface NavbarProps {
  storyboard: Storyboard | null;
  isExporting: boolean;
  onExportPDF: () => void;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  storyboard,
  isExporting,
  onExportPDF,
  onReset,
}) => {
  const totalDuration = storyboard
    ? Math.round(
        storyboard.scenes.reduce((acc, sc) => {
          const match = sc.duration?.match(/\d+(\.\d+)?/);
          return acc + (match ? parseFloat(match[0]) : 4);
        }, 0)
      )
    : 0;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#07080d]/80 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 ring-1 ring-white/20">
            <Clapperboard className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold font-display tracking-tight text-white text-base sm:text-lg">
                AI DIRECTOR
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-md">
                PRO 3.1
              </span>
            </div>
            <span className="text-[10px] text-white/40 tracking-wider font-mono hidden sm:inline">
              Cinematic Vertical Video Studio
            </span>
          </div>
        </div>

        {/* Center: Storyboard Stats when available */}
        {storyboard && (
          <div className="hidden md:flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] px-3.5 py-1.5 rounded-full">
            <span className="flex items-center gap-1.5 text-xs text-white/70 font-medium">
              <Film className="w-3.5 h-3.5 text-orange-400" />
              <strong className="text-white font-mono">{storyboard.scenes.length}</strong> plans
            </span>
            <span className="text-white/20">•</span>
            <span className="text-xs text-white/70 font-medium">
              ~<strong className="text-white font-mono">{totalDuration}s</strong> format 9:16
            </span>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {storyboard && (
            <>
              <button
                type="button"
                onClick={onReset}
                className="px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-transparent hover:border-white/10"
                title="Nouveau projet / Réinitialiser"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nouveau</span>
              </button>

              <button
                type="button"
                onClick={onExportPDF}
                disabled={isExporting}
                className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-orange-500/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExporting ? 'Export...' : 'Exporter PDF'}</span>
              </button>
            </>
          )}

          {!storyboard && (
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Studio Prêt</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
