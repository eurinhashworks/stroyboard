import React, { useEffect, useRef } from 'react';
import { Sparkles, Terminal, Activity, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

interface DirectorMonitorProps {
  streamingText: string;
  modelName: string;
}

export const DirectorMonitor: React.FC<DirectorMonitorProps> = ({
  streamingText,
  modelName,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [streamingText]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="mb-14"
    >
      <div className="bg-[#0a0b12] border border-orange-500/30 rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(249,115,22,0.12)]">
        {/* Top Monitor Header */}
        <div className="bg-gradient-to-r from-orange-500/15 via-[#0e101b] to-orange-500/5 border-b border-orange-500/20 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-orange-400">
                Studio Neural Live Feed
              </span>
            </div>
            <span className="text-white/20 text-xs">•</span>
            <div className="flex items-center gap-1 text-[11px] font-mono text-white/50">
              <Cpu className="w-3.5 h-3.5 text-orange-400" />
              <span>{modelName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-white/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>STREAMING DÉCOUPAGE 9:16</span>
          </div>
        </div>

        {/* Dynamic Studio Progress Stages */}
        <div className="grid grid-cols-3 border-b border-white/[0.06] bg-black/40 text-[11px] font-mono text-center">
          <div className="py-2 px-3 flex items-center justify-center gap-1.5 text-orange-400 bg-orange-500/10 border-r border-white/[0.06]">
            <Sparkles className="w-3 h-3 animate-spin" />
            <span className="truncate">1. Analyse Narration</span>
          </div>
          <div className="py-2 px-3 flex items-center justify-center gap-1.5 text-white/70 border-r border-white/[0.06]">
            <Activity className="w-3 h-3 text-orange-400 animate-pulse" />
            <span className="truncate">2. Plans 3-4s & Rythme</span>
          </div>
          <div className="py-2 px-3 flex items-center justify-center gap-1.5 text-white/50">
            <Terminal className="w-3 h-3" />
            <span className="truncate">3. Prompts & Voix Off</span>
          </div>
        </div>

        {/* Terminal Output Area */}
        <div
          ref={terminalRef}
          className="p-6 md:p-8 font-mono text-xs text-orange-400/80 leading-relaxed h-72 overflow-y-auto bg-black/60 scrollbar-none"
        >
          <div className="space-y-2">
            <div className="text-white/40 flex items-center gap-2">
              <span className="text-orange-500/50">[{new Date().toLocaleTimeString()}]</span>
              <span>Initialisation du moteur de découpage cinématographique...</span>
            </div>
            <div className="text-white/40 flex items-center gap-2">
              <span className="text-orange-500/50">[{new Date().toLocaleTimeString()}]</span>
              <span>Extraction des arcs dramatiques et des points d'attention visuels 9:16...</span>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] text-orange-300/90 whitespace-pre-wrap break-all leading-normal font-mono text-[11px]">
              {streamingText || "Génération des plans en cours, synchronisation avec le modèle..."}
              <motion.span
                animate={{ opacity: [0, 1] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="inline-block w-2 h-3.5 bg-orange-400 ml-1 align-middle"
              />
            </div>
          </div>
        </div>

        {/* Bottom Status bar */}
        <div className="bg-[#090a10] px-5 py-2 border-t border-white/[0.06] flex items-center justify-between text-[9px] font-mono text-white/40 uppercase tracking-wider">
          <span>Latence réseau: Minimale</span>
          <span className="text-orange-400/80">Format de sortie: JSON Structuré</span>
        </div>
      </div>
    </motion.section>
  );
};
