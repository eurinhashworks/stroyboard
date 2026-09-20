import React, { useState } from 'react';
import { 
  Clock, 
  Smile, 
  Camera, 
  Sparkles, 
  Download, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Trash2, 
  Edit3, 
  Maximize2, 
  Check, 
  Type as TypeIcon,
  Image as ImageIcon,
  Loader2,
  Film
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Scene } from '../types';
import { AudioPlayer } from './AudioPlayer';

interface SceneCardProps {
  scene: Scene;
  index: number;
  totalScenes: number;
  isRegenerating: boolean;
  isEditing: boolean;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  onStartEdit: (index: number) => void;
  onSaveEdit: (index: number, updatedScene: Partial<Scene>) => void;
  onCancelEdit: () => void;
  onRegenerateImage: (index: number) => void;
  onGenerateVoiceover?: (index: number) => void;
  onOpenImageModal: (scene: Scene) => void;
  onDownload: (url: string, filename: string) => void;
}

export const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  index,
  totalScenes,
  isRegenerating,
  isEditing,
  onMove,
  onDuplicate,
  onDelete,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onRegenerateImage,
  onOpenImageModal,
  onDownload,
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [showPromptDetails, setShowPromptDetails] = useState(false);
  const [editData, setEditData] = useState<Partial<Scene>>({ ...scene });

  // Update edit data if scene prop changes
  React.useEffect(() => {
    if (isEditing) {
      setEditData({ ...scene });
    }
  }, [isEditing, scene]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(scene.imagePrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ layout: { duration: 0.25, ease: 'easeInOut' } }}
      className={`relative group bg-[#0d0f17]/90 backdrop-blur-xl border ${
        isEditing
          ? 'border-orange-500/50 ring-1 ring-orange-500/30'
          : 'border-white/[0.08] hover:border-white/[0.18]'
      } rounded-2xl md:rounded-3xl p-5 md:p-7 transition-all duration-300 shadow-xl`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Left Column: 9:16 Vertical Video Frame */}
        <div className="lg:col-span-4 flex flex-col items-center">
          <div className="w-full max-w-[240px] lg:max-w-none aspect-[9/16] bg-[#07080c] rounded-2xl overflow-hidden relative border border-white/10 shadow-2xl group/media">
            
            {/* Loading / Regenerating State */}
            {isRegenerating ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-center">
                <div className="relative mb-3">
                  <div className="w-12 h-12 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
                  <Sparkles className="w-5 h-5 text-orange-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-orange-400">Rendu Visuel 9:16...</span>
                <span className="text-[9px] text-white/40 mt-1 font-mono">Gemini Flash Image</span>
              </div>
            ) : scene.previewUrl ? (
              <>
                <img
                  src={scene.previewUrl}
                  alt={`Scène ${scene.number}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/media:scale-[1.03]"
                />
                
                {/* Subtle vignette gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover/media:opacity-100 transition-opacity duration-300" />

                {/* Floating Quick Action Overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-3 opacity-0 group-hover/media:opacity-100 transition-opacity duration-300 z-20">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => onOpenImageModal(scene)}
                      className="p-2 bg-black/70 hover:bg-orange-500 text-white rounded-xl backdrop-blur-md transition-all shadow-lg cursor-pointer"
                      title="Plein écran (Agrandir)"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onDownload(scene.previewUrl!, `scene-${scene.number}.png`)}
                      className="p-2.5 bg-black/80 hover:bg-white text-white hover:text-black rounded-xl backdrop-blur-md transition-all shadow-lg cursor-pointer"
                      title="Télécharger l'image PNG"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRegenerateImage(index)}
                      className="p-2.5 bg-black/80 hover:bg-orange-500 text-white rounded-xl backdrop-blur-md transition-all shadow-lg cursor-pointer"
                      title="Régénérer le visuel"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Empty Placeholder State */
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-white/[0.02] to-transparent">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/30 mb-3 group-hover/media:text-orange-400 group-hover/media:border-orange-500/30 transition-all">
                  <Film className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1">Cadre 9:16</span>
                <span className="text-[10px] text-white/20 mb-4 max-w-[140px] leading-tight">Format vertical TikTok / Reels</span>
                <button
                  type="button"
                  onClick={() => onRegenerateImage(index)}
                  className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border border-orange-500/30 hover:border-transparent cursor-pointer shadow-sm hover:shadow-orange-500/20 active:scale-95"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Créer visuel
                  </span>
                </button>
              </div>
            )}

            {/* Scene Number Badge & Mini Reorder Arrows on thumbnail */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 z-20">
              <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-black text-sm font-display shadow-lg shadow-orange-500/30 ring-2 ring-black/40">
                {scene.number}
              </div>
              <div className="flex flex-col bg-black/75 backdrop-blur-md rounded-md p-0.5 border border-white/10 shadow-md">
                <button
                  type="button"
                  onClick={() => onMove(index, 'up')}
                  disabled={index === 0}
                  className="p-0.5 hover:bg-orange-500 text-white/70 hover:text-white rounded transition-colors disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                  title="Déplacer vers le haut"
                  aria-label="Monter"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onMove(index, 'down')}
                  disabled={index === totalScenes - 1}
                  className="p-0.5 hover:bg-orange-500 text-white/70 hover:text-white rounded transition-colors disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                  title="Déplacer vers le bas"
                  aria-label="Descendre"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Scene Director Information */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          {isEditing ? (
            /* Inline Edit Form Mode */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" /> Éditeur de Plan
                  </span>
                  <span className="text-xs text-white/40">• Scène #{scene.number}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onSaveEdit(index, editData)}
                    className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-md"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={onCancelEdit}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium rounded-lg transition-all cursor-pointer border border-white/10"
                  >
                    Annuler
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">Durée</label>
                  <input
                    type="text"
                    value={editData.duration || ''}
                    onChange={(e) => setEditData({ ...editData, duration: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    placeholder="3-4s"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">Émotion</label>
                  <input
                    type="text"
                    value={editData.emotion || ''}
                    onChange={(e) => setEditData({ ...editData, emotion: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    placeholder="Mystérieux, Épique..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">Mouvement Caméra</label>
                  <input
                    type="text"
                    value={editData.cameraMovement || ''}
                    onChange={(e) => setEditData({ ...editData, cameraMovement: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    placeholder="Travelling avant, Panoramique..."
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-1 block">Voix Off (Narration)</label>
                <textarea
                  value={editData.voiceover || ''}
                  onChange={(e) => setEditData({ ...editData, voiceover: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-orange-500 rounded-xl px-3 py-2 text-sm text-white outline-none h-20 resize-none font-sans"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">Description Visuelle</label>
                <textarea
                  value={editData.visualDescription || ''}
                  onChange={(e) => setEditData({ ...editData, visualDescription: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white outline-none h-18 resize-none font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">Texte Incrusté à l'écran</label>
                  <input
                    type="text"
                    value={editData.onScreenText || ''}
                    onChange={(e) => setEditData({ ...editData, onScreenText: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                    placeholder="Sous-titres ou mot clé"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">Prompt Image (Anglais)</label>
                  <input
                    type="text"
                    value={editData.imagePrompt || ''}
                    onChange={(e) => setEditData({ ...editData, imagePrompt: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Normal View Mode */
            <div className="space-y-5">
              {/* Header Meta row with Tool buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-white/[0.07]">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.05] border border-white/[0.08] rounded-full text-[11px] font-medium text-white/80">
                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                    <span>{scene.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.05] border border-white/[0.08] rounded-full text-[11px] font-medium text-white/80">
                    <Smile className="w-3.5 h-3.5 text-amber-400" />
                    <span>{scene.emotion}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.05] border border-white/[0.08] rounded-full text-[11px] font-medium text-white/80">
                    <Camera className="w-3.5 h-3.5 text-orange-400" />
                    <span>{scene.cameraMovement}</span>
                  </div>
                </div>

                {/* Card Action Controls: Reorder, Duplicate, Edit, Delete */}
                <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-xl p-1">
                  {/* Sequence Position */}
                  <div className="flex items-center px-1 text-[11px] font-mono font-bold text-white/50">
                    #{scene.number}/{totalScenes}
                  </div>

                  {/* Move Up */}
                  <button
                    type="button"
                    onClick={() => onMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-orange-400 transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                    title="Monter ce plan"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  {/* Move Down */}
                  <button
                    type="button"
                    onClick={() => onMove(index, 'down')}
                    disabled={index === totalScenes - 1}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-orange-400 transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                    title="Descendre ce plan"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

                  {/* Duplicate Button */}
                  <button
                    type="button"
                    onClick={() => onDuplicate(index)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-orange-400 transition-colors cursor-pointer"
                    title="Dupliquer la scène"
                    aria-label="Dupliquer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => onStartEdit(index)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-orange-400 transition-colors cursor-pointer"
                    title="Modifier ce plan"
                    aria-label="Modifier"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => onDelete(index)}
                    disabled={totalScenes <= 1}
                    className="p-1.5 hover:bg-red-500/20 rounded-lg text-white/40 hover:text-red-400 transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                    title="Supprimer ce plan"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Voiceover block */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
                    Voix Off
                  </span>
                </div>
                <p className="text-xl md:text-2xl font-semibold text-white/95 leading-relaxed tracking-tight">
                  "{scene.voiceover}"
                </p>

                {/* Audio Player if generated */}
                {scene.audioUrl && (
                  <AudioPlayer
                    url={scene.audioUrl}
                    filename={`scene-${scene.number}-voixoff.mp3`}
                    label={`Voix Off • Plan #${scene.number}`}
                  />
                )}
              </div>

              {/* Visual Description */}
              <div className="p-3.5 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
                  Découpage Visuel & Action
                </span>
                <p className="text-sm text-white/70 leading-relaxed font-sans">
                  {scene.visualDescription}
                </p>
              </div>

              {/* Subtitle & Prompt Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* On screen text */}
                <div className="flex items-start gap-2.5 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                  <TypeIcon className="w-4 h-4 text-orange-400/80 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">Incrustation Écran</span>
                    <span className="text-xs font-mono text-orange-300/90 font-medium truncate block">
                      {scene.onScreenText || '—'}
                    </span>
                  </div>
                </div>

                {/* AI Prompt collapsible */}
                <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowPromptDetails(!showPromptDetails)}
                      className="text-[10px] font-bold uppercase tracking-wider text-white/40 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-orange-400" />
                      <span>Prompt Générateur</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-orange-400 transition-colors cursor-pointer"
                      title="Copier le prompt image"
                    >
                      {copiedPrompt ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <p className={`text-[11px] font-mono text-white/40 mt-1 italic select-all leading-relaxed ${
                    showPromptDetails ? '' : 'line-clamp-1'
                  }`}>
                    {scene.imagePrompt}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
