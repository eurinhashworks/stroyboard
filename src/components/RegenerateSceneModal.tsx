import React, { useState } from 'react';
import { 
  Wand2, 
  Sparkles, 
  X, 
  RotateCcw, 
  AlertCircle, 
  Loader2, 
  Sliders, 
  MessageSquare, 
  Film,
  Camera,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scene } from '../types';

interface RegenerateSceneModalProps {
  isOpen: boolean;
  scene: Scene | null;
  sceneIndex: number;
  totalScenes: number;
  isRegenerating: boolean;
  onClose: () => void;
  onConfirmRegenerate: (index: number, customInstructions?: string) => Promise<void>;
}

const QUICK_INSTRUCTIONS = [
  'Augmenter la tension dramatique',
  'Ajouter un dialogue percutant',
  'Rendre l’action plus rythmée et dynamique',
  'Mettre l’accent sur l’émotion intime',
  'Modifier l’angle de vue et le décor',
  'Insister sur un détail ou objet clé'
];

export const RegenerateSceneModal: React.FC<RegenerateSceneModalProps> = ({
  isOpen,
  scene,
  sceneIndex,
  totalScenes,
  isRegenerating,
  onClose,
  onConfirmRegenerate,
}) => {
  const [instructions, setInstructions] = useState('');

  if (!isOpen || !scene) return null;

  const handleSelectQuick = (text: string) => {
    if (!instructions) {
      setInstructions(text);
    } else {
      setInstructions(prev => `${prev} • ${text}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirmRegenerate(sceneIndex, instructions.trim() || undefined);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isRegenerating ? undefined : onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-lg bg-[#0c0e17] border border-orange-500/30 rounded-3xl p-6 sm:p-7 shadow-[0_0_80px_rgba(249,115,22,0.15)] z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Wand2 className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400">
                  Réalisateur IA • Scène Unique
                </span>
                <h3 className="text-lg font-bold text-white font-display">
                  Régénérer la Scène #{scene.number}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isRegenerating}
              className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all disabled:opacity-30 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            {/* Current Scene Snapshot preview */}
            <div className="p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-[11px] text-white/50">
                <span className="font-semibold text-white/80">Titre actuel :</span>
                <span className="text-orange-400 font-mono font-bold">
                  {scene.titre || `Plan #${scene.number}`}
                </span>
              </div>
              <div className="text-xs text-white/70 italic line-clamp-2 bg-black/30 p-2.5 rounded-xl border border-white/[0.04]">
                "{scene.narration || scene.voiceover}"
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-white/50">
                {scene.lieu && (
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                    📍 {scene.lieu}
                  </span>
                )}
                {scene.emotion && (
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                    🎭 {scene.emotion}
                  </span>
                )}
                {scene.importance_narrative && (
                  <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    ⭐ {scene.importance_narrative}
                  </span>
                )}
              </div>
            </div>

            {/* Custom Guidance input */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center justify-between mb-2">
                <span>Instructions spécifiques (Optionnel)</span>
                <span className="text-[10px] font-normal text-white/40 font-mono">Consignes pour l'IA</span>
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                disabled={isRegenerating}
                placeholder="Ex: Rends la scène plus menaçante, fais parler le personnage d'un ton autoritaire, déplace l'action au bord de la falaise..."
                className="w-full h-24 bg-white/[0.03] border border-white/10 focus:border-orange-500 rounded-2xl p-3 text-xs text-white placeholder:text-white/30 outline-none resize-none transition-all"
              />
            </div>

            {/* Quick Inspiration Pills */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">
                Suggestions rapides :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_INSTRUCTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectQuick(suggestion)}
                    disabled={isRegenerating}
                    className="px-2.5 py-1 bg-white/[0.03] hover:bg-orange-500/15 border border-white/[0.06] hover:border-orange-500/30 text-white/70 hover:text-orange-300 rounded-lg text-[11px] transition-all cursor-pointer disabled:opacity-40"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Notice info */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-200/90 leading-relaxed">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                Seule la <strong>Scène #{scene.number}</strong> sera réécrite avec ses 12 dimensions narratives (titre, résumé, dialogue, narration, etc.). Les scènes précédentes et suivantes sont préservées intactes pour garantir une continuité parfaite.
              </span>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isRegenerating}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/10 cursor-pointer disabled:opacity-40"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isRegenerating}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Régénération en cours...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Régénérer cette scène</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
