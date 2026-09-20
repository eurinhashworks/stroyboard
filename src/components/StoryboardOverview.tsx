import React from 'react';
import { Film, Clock, Sparkles } from 'lucide-react';
import { Scene } from '../types';

interface StoryboardOverviewProps {
  scenes: Scene[];
  onSelectScene: (index: number) => void;
}

export const StoryboardOverview: React.FC<StoryboardOverviewProps> = ({
  scenes,
  onSelectScene,
}) => {
  return (
    <div className="bg-[#0b0d15] border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Ruban Chronologique (Timeline 9:16)
          </span>
        </div>
        <span className="text-[10px] font-mono text-white/40">
          {scenes.length} plans séquentiels
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {scenes.map((scene, idx) => (
          <button
            key={scene.id || `thumb-${idx}`}
            type="button"
            onClick={() => onSelectScene(idx)}
            className="flex-shrink-0 w-32 group/thumb text-left bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] hover:border-orange-500/50 rounded-xl p-2 transition-all cursor-pointer"
          >
            {/* Aspect 9:16 thumbnail */}
            <div className="w-full aspect-[9/16] bg-[#07080c] rounded-lg overflow-hidden relative mb-2 border border-white/[0.06]">
              {scene.previewUrl ? (
                <img
                  src={scene.previewUrl}
                  alt={`Plan ${scene.number}`}
                  className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-orange-500 text-white font-mono text-[9px] font-bold rounded">
                #{scene.number}
              </div>
              <div className="absolute bottom-1.5 right-1.5 px-1 py-0.5 bg-black/70 text-white/80 font-mono text-[8px] rounded flex items-center gap-0.5">
                <Clock className="w-2 h-2 text-orange-400" />
                {scene.duration}
              </div>
            </div>

            <p className="text-[10px] text-white/70 line-clamp-2 leading-tight">
              "{scene.voiceover}"
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
