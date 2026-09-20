import React, { useEffect } from 'react';
import { X, Download, Copy, Sparkles, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Scene } from '../types';

interface ImageModalProps {
  scene: Scene | null;
  totalScenes: number;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onDownload: (url: string, filename: string) => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  scene,
  totalScenes,
  onClose,
  onPrev,
  onNext,
  onDownload,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  if (!scene || !scene.previewUrl) return null;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(scene.imagePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full max-h-[92vh] bg-[#0c0d14] border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/60 hover:bg-white/20 text-white/70 hover:text-white rounded-full backdrop-blur-md transition-all cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: 9:16 Vertical Preview Frame */}
        <div className="md:w-1/2 bg-black/70 flex items-center justify-center p-4 relative group">
          <div className="relative aspect-[9/16] max-h-[75vh] w-auto max-w-full rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <img
              src={scene.previewUrl}
              alt={`Scène ${scene.number}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-lg">
              PLAN #{scene.number}
            </div>
          </div>

          {/* Navigation buttons */}
          {onPrev && (
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-orange-500 text-white rounded-full backdrop-blur-sm transition-all"
              title="Scène précédente"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {onNext && (
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-orange-500 text-white rounded-full backdrop-blur-sm transition-all"
              title="Scène suivante"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Right: Scene Metadata & Prompt Specs */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[85vh]">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
                  Aperçu Cinématographique
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-white mt-0.5">
                  Scène {scene.number} sur {totalScenes}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-white/70">
                  {scene.duration}
                </span>
              </div>
            </div>

            {/* Voiceover Quote */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5 block">
                Voix Off
              </label>
              <p className="text-lg font-medium text-white/95 leading-snug italic border-l-2 border-orange-500 pl-3">
                "{scene.voiceover}"
              </p>
            </div>

            {/* Visual Description */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5 block">
                Découpage Visuel
              </label>
              <p className="text-sm text-white/70 leading-relaxed">
                {scene.visualDescription}
              </p>
            </div>

            {/* Camera & Emotion */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">Mouvement Caméra</span>
                <span className="text-xs font-semibold text-orange-400/90">{scene.cameraMovement}</span>
              </div>
              <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">Atmosphère / Ton</span>
                <span className="text-xs font-semibold text-white/80">{scene.emotion}</span>
              </div>
            </div>

            {/* Prompt */}
            <div className="p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-orange-500" /> Prompt Générateur 9:16
                </span>
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1 text-[10px] font-bold text-white/60 hover:text-orange-400 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copié !' : 'Copier'}
                </button>
              </div>
              <p className="text-xs font-mono text-white/60 leading-relaxed select-all">
                {scene.imagePrompt}
              </p>
            </div>
          </div>

          {/* Footer action */}
          <div className="pt-6 border-t border-white/10 flex items-center gap-3">
            <button
              onClick={() => onDownload(scene.previewUrl!, `scene-${scene.number}-9x16.png`)}
              className="flex-1 py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" /> Télécharger l'image 9:16
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
