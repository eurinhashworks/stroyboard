import React, { useState } from 'react';
import { 
  Users, 
  MapPin, 
  Clock, 
  Key, 
  Flame, 
  MessageSquare, 
  Heart, 
  Compass, 
  Swords, 
  CheckCircle2, 
  Edit3, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Layers,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NarrativeAnalysis, NarrativeCharacter, NarrativeLocation, NarrativeItem } from '../types';

interface NarrativeAnalysisDeckProps {
  analysis: NarrativeAnalysis;
  onUpdateAnalysis: (updated: NarrativeAnalysis) => void;
  storyText?: string;
}

export const NarrativeAnalysisDeck: React.FC<NarrativeAnalysisDeckProps> = ({
  analysis,
  onUpdateAnalysis,
  storyText,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'structure' | 'characters' | 'world' | 'drama'>('structure');
  const [editedAnalysis, setEditedAnalysis] = useState<NarrativeAnalysis>(analysis);

  // Sync state if analysis changes from outside
  React.useEffect(() => {
    setEditedAnalysis(analysis);
  }, [analysis]);

  const handleSave = () => {
    onUpdateAnalysis(editedAnalysis);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedAnalysis(analysis);
    setIsEditing(false);
  };

  // Helpers to mutate characters
  const handleAddCharacter = () => {
    setEditedAnalysis(prev => ({
      ...prev,
      personnages: [
        ...prev.personnages,
        { nom: 'Nouveau Personnage', role: 'Secondaire', description: 'Description du personnage' }
      ]
    }));
  };

  const handleUpdateCharacter = (idx: number, patch: Partial<NarrativeCharacter>) => {
    setEditedAnalysis(prev => {
      const next = [...prev.personnages];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, personnages: next };
    });
  };

  const handleDeleteCharacter = (idx: number) => {
    setEditedAnalysis(prev => ({
      ...prev,
      personnages: prev.personnages.filter((_, i) => i !== idx)
    }));
  };

  // Helpers to mutate locations
  const handleAddLocation = () => {
    setEditedAnalysis(prev => ({
      ...prev,
      lieux: [
        ...prev.lieux,
        { nom: 'Nouveau Lieu', description: 'Description spatiale', ambiance: 'Atmosphère' }
      ]
    }));
  };

  const handleUpdateLocation = (idx: number, patch: Partial<NarrativeLocation>) => {
    setEditedAnalysis(prev => {
      const next = [...prev.lieux];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, lieux: next };
    });
  };

  const handleDeleteLocation = (idx: number) => {
    setEditedAnalysis(prev => ({
      ...prev,
      lieux: prev.lieux.filter((_, i) => i !== idx)
    }));
  };

  // Helpers to mutate items
  const handleAddItem = () => {
    setEditedAnalysis(prev => ({
      ...prev,
      objetsImportants: [
        ...prev.objetsImportants,
        { nom: 'Nouvel Objet', signification: 'Signification symbolique', roleNarratif: 'Rôle dans l’intrigue' }
      ]
    }));
  };

  const handleUpdateItem = (idx: number, patch: Partial<NarrativeItem>) => {
    setEditedAnalysis(prev => {
      const next = [...prev.objetsImportants];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, objetsImportants: next };
    });
  };

  const handleDeleteItem = (idx: number) => {
    setEditedAnalysis(prev => ({
      ...prev,
      objetsImportants: prev.objetsImportants.filter((_, i) => i !== idx)
    }));
  };

  return (
    <div className="bg-[#0a0c14] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 mb-12">
      {/* Header Banner */}
      <div className="p-5 sm:p-7 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border-b border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 flex-shrink-0 shadow-lg shadow-orange-500/10">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[10px] font-bold uppercase tracking-wider font-mono">
                Moteur d'Analyse Narrative
              </span>
              <span className="text-xs text-white/40">• 14 Dimensions IA analysées</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
              Structure Dramatique & Univers Narratif
            </h2>
            <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-3xl">
              Cartographie complète des arcs dramatiques, personnages, conflits et décors extraits de l'histoire.
            </p>
          </div>
        </div>

        {/* Edit / Save controls */}
        <div className="flex items-center gap-2 self-start md:self-center">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl text-xs font-medium transition-all flex items-center gap-1 border border-white/10 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Annuler</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-orange-500/40 text-white/90 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5 text-orange-400" />
              <span>Modifier l'analyse</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 sm:gap-2 px-5 sm:px-7 pt-4 border-b border-white/[0.06] bg-black/30 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('structure')}
          className={`px-4 py-2.5 border-b-2 text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'structure'
              ? 'border-orange-500 text-orange-400 bg-orange-500/5'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Structure en 4 Actes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('characters')}
          className={`px-4 py-2.5 border-b-2 text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'characters'
              ? 'border-orange-500 text-orange-400 bg-orange-500/5'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Personnages ({editedAnalysis.personnages?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('world')}
          className={`px-4 py-2.5 border-b-2 text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'world'
              ? 'border-orange-500 text-orange-400 bg-orange-500/5'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Monde, Lieux & Objets</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('drama')}
          className={`px-4 py-2.5 border-b-2 text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'drama'
              ? 'border-orange-500 text-orange-400 bg-orange-500/5'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Conflit, Événements & Ambiance</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="p-5 sm:p-7">
        {/* TAB 1: 4-ACT DRAMATIC STRUCTURE */}
        {activeTab === 'structure' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* ACT 1: DÉBUT */}
              <div className="p-4 sm:p-5 bg-white/[0.02] border border-white/[0.08] hover:border-orange-500/30 rounded-2xl transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/20 text-[10px] font-bold font-mono">
                    ACTE 1
                  </span>
                  <span className="text-xs font-bold text-white/80">Début & Déclencheur</span>
                </div>
                {isEditing ? (
                  <textarea
                    value={editedAnalysis.structure?.debut || ''}
                    onChange={(e) => setEditedAnalysis({
                      ...editedAnalysis,
                      structure: { ...editedAnalysis.structure, debut: e.target.value }
                    })}
                    className="w-full h-32 bg-black/40 border border-white/10 focus:border-orange-500 rounded-xl p-3 text-xs text-white leading-relaxed resize-none outline-none"
                    placeholder="Mise en place, situation initiale..."
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                    {editedAnalysis.structure?.debut || 'Non défini'}
                  </p>
                )}
              </div>

              {/* ACT 2: DÉVELOPPEMENT */}
              <div className="p-4 sm:p-5 bg-white/[0.02] border border-white/[0.08] hover:border-orange-500/30 rounded-2xl transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[10px] font-bold font-mono">
                    ACTE 2
                  </span>
                  <span className="text-xs font-bold text-white/80">Développement & Péripéties</span>
                </div>
                {isEditing ? (
                  <textarea
                    value={editedAnalysis.structure?.developpement || ''}
                    onChange={(e) => setEditedAnalysis({
                      ...editedAnalysis,
                      structure: { ...editedAnalysis.structure, developpement: e.target.value }
                    })}
                    className="w-full h-32 bg-black/40 border border-white/10 focus:border-orange-500 rounded-xl p-3 text-xs text-white leading-relaxed resize-none outline-none"
                    placeholder="Péripéties, obstacles, montée en tension..."
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                    {editedAnalysis.structure?.developpement || 'Non défini'}
                  </p>
                )}
              </div>

              {/* ACT 3: CLIMAX */}
              <div className="p-4 sm:p-5 bg-gradient-to-b from-orange-500/10 to-white/[0.02] border border-orange-500/30 rounded-2xl transition-all shadow-lg shadow-orange-500/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-orange-500 text-white text-[10px] font-bold font-mono shadow-sm">
                    ACTE 3
                  </span>
                  <span className="text-xs font-black text-orange-400">Climax Dramatique</span>
                </div>
                {isEditing ? (
                  <textarea
                    value={editedAnalysis.structure?.climax || ''}
                    onChange={(e) => setEditedAnalysis({
                      ...editedAnalysis,
                      structure: { ...editedAnalysis.structure, climax: e.target.value }
                    })}
                    className="w-full h-32 bg-black/40 border border-orange-500/40 focus:border-orange-500 rounded-xl p-3 text-xs text-white leading-relaxed resize-none outline-none"
                    placeholder="Point culminant, confrontation ou révélation majeure..."
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium">
                    {editedAnalysis.structure?.climax || 'Non défini'}
                  </p>
                )}
              </div>

              {/* ACT 4: CONCLUSION */}
              <div className="p-4 sm:p-5 bg-white/[0.02] border border-white/[0.08] hover:border-emerald-500/30 rounded-2xl transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold font-mono">
                    ACTE 4
                  </span>
                  <span className="text-xs font-bold text-white/80">Conclusion & Dénouement</span>
                </div>
                {isEditing ? (
                  <textarea
                    value={editedAnalysis.structure?.conclusion || ''}
                    onChange={(e) => setEditedAnalysis({
                      ...editedAnalysis,
                      structure: { ...editedAnalysis.structure, conclusion: e.target.value }
                    })}
                    className="w-full h-32 bg-black/40 border border-white/10 focus:border-orange-500 rounded-xl p-3 text-xs text-white leading-relaxed resize-none outline-none"
                    placeholder="Résolution finale, état transformé des personnages..."
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                    {editedAnalysis.structure?.conclusion || 'Non défini'}
                  </p>
                )}
              </div>
            </div>

            {/* Conflict & Era Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                <div className="flex items-center gap-2 mb-2 text-rose-400">
                  <Swords className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Conflit Central</span>
                </div>
                {isEditing ? (
                  <textarea
                    value={editedAnalysis.conflitPrincipal || ''}
                    onChange={(e) => setEditedAnalysis({ ...editedAnalysis, conflitPrincipal: e.target.value })}
                    className="w-full h-20 bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-orange-500"
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                    {editedAnalysis.conflitPrincipal || 'Non spécifié'}
                  </p>
                )}
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                <div className="flex items-center gap-2 mb-2 text-cyan-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Époque & Temporalité</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedAnalysis.epoque || ''}
                    onChange={(e) => setEditedAnalysis({ ...editedAnalysis, epoque: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-orange-500"
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                    {editedAnalysis.epoque || 'Non spécifié'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PERSONNAGES */}
        {activeTab === 'characters' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">
                Personnages clés identifiés par le moteur narratif :
              </span>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleAddCharacter}
                  className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter un personnage</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {editedAnalysis.personnages?.map((char, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white/[0.02] border border-white/[0.08] hover:border-orange-500/40 rounded-2xl transition-all flex flex-col justify-between"
                >
                  {isEditing ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={char.nom}
                          onChange={(e) => handleUpdateCharacter(idx, { nom: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-bold"
                          placeholder="Nom"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteCharacter(idx)}
                          className="p-1 text-rose-400 hover:bg-rose-500/20 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={char.role}
                        onChange={(e) => handleUpdateCharacter(idx, { role: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-orange-400 font-medium"
                        placeholder="Rôle (Protagoniste, Antagoniste...)"
                      />
                      <textarea
                        value={char.description}
                        onChange={(e) => handleUpdateCharacter(idx, { description: e.target.value })}
                        className="w-full h-16 bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white/80 resize-none"
                        placeholder="Description & motivation..."
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <h4 className="text-sm font-bold text-white font-display flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-orange-400" />
                            {char.nom}
                          </h4>
                          <span className="px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/20 text-[10px] font-mono font-bold">
                            {char.role}
                          </span>
                        </div>
                        <p className="text-xs text-white/70 leading-relaxed mt-2">
                          {char.description}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: LIEUX & OBJETS */}
        {activeTab === 'world' && (
          <div className="space-y-8">
            {/* Locations */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  <span>Lieux & Décors ({editedAnalysis.lieux?.length || 0})</span>
                </h3>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleAddLocation}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white/80 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer border border-white/10"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Ajouter lieu</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {editedAnalysis.lieux?.map((loc, idx) => (
                  <div key={idx} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={loc.nom}
                            onChange={(e) => handleUpdateLocation(idx, { nom: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-bold"
                            placeholder="Nom du lieu"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteLocation(idx)}
                            className="p-1 text-rose-400 hover:bg-rose-500/20 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={loc.ambiance}
                          onChange={(e) => handleUpdateLocation(idx, { ambiance: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-amber-400"
                          placeholder="Ambiance spatiale"
                        />
                        <textarea
                          value={loc.description}
                          onChange={(e) => handleUpdateLocation(idx, { description: e.target.value })}
                          className="w-full h-14 bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white/80 resize-none"
                          placeholder="Description visuelle..."
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-white">{loc.nom}</span>
                          <span className="text-[10px] text-amber-400 font-mono">{loc.ambiance}</span>
                        </div>
                        <p className="text-xs text-white/70 leading-relaxed mt-1">
                          {loc.description}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Key Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>Objets Importants & Symboles ({editedAnalysis.objetsImportants?.length || 0})</span>
                </h3>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white/80 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer border border-white/10"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Ajouter objet</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {editedAnalysis.objetsImportants?.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={item.nom}
                            onChange={(e) => handleUpdateItem(idx, { nom: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-bold"
                            placeholder="Nom de l'objet"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(idx)}
                            className="p-1 text-rose-400 hover:bg-rose-500/20 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={item.roleNarratif}
                          onChange={(e) => handleUpdateItem(idx, { roleNarratif: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-orange-400"
                          placeholder="Rôle narratif"
                        />
                        <textarea
                          value={item.signification}
                          onChange={(e) => handleUpdateItem(idx, { signification: e.target.value })}
                          className="w-full h-14 bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white/80 resize-none"
                          placeholder="Signification symbolique..."
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-white">{item.nom}</span>
                          <span className="text-[10px] text-orange-400 font-mono">{item.roleNarratif}</span>
                        </div>
                        <p className="text-xs text-white/70 leading-relaxed mt-1">
                          {item.signification}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DRAMA, ACTIONS, DIALOGUES, EMOTIONS */}
        {activeTab === 'drama' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Actions & Events */}
            <div className="space-y-4">
              <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5 mb-3">
                  <Flame className="w-4 h-4" />
                  <span>Actions Majeures</span>
                </h4>
                {isEditing ? (
                  <textarea
                    value={editedAnalysis.actions?.join('\n') || ''}
                    onChange={(e) => setEditedAnalysis({
                      ...editedAnalysis,
                      actions: e.target.value.split('\n').filter(Boolean)
                    })}
                    className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none"
                    placeholder="Une action par ligne..."
                  />
                ) : (
                  <ul className="space-y-1.5">
                    {editedAnalysis.actions?.map((act, i) => (
                      <li key={i} className="text-xs text-white/80 flex items-start gap-2">
                        <span className="text-orange-400 mt-0.5">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-3">
                  <Clock className="w-4 h-4" />
                  <span>Événements & Jalons</span>
                </h4>
                {isEditing ? (
                  <textarea
                    value={editedAnalysis.evenements?.join('\n') || ''}
                    onChange={(e) => setEditedAnalysis({
                      ...editedAnalysis,
                      evenements: e.target.value.split('\n').filter(Boolean)
                    })}
                    className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none"
                    placeholder="Un événement par ligne..."
                  />
                ) : (
                  <ul className="space-y-1.5">
                    {editedAnalysis.evenements?.map((ev, i) => (
                      <li key={i} className="text-xs text-white/80 flex items-start gap-2">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Dialogues, Emotions & Atmosphere */}
            <div className="space-y-4">
              <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-3">
                  <MessageSquare className="w-4 h-4" />
                  <span>Dialogues Clés</span>
                </h4>
                {isEditing ? (
                  <textarea
                    value={editedAnalysis.dialogues?.join('\n') || ''}
                    onChange={(e) => setEditedAnalysis({
                      ...editedAnalysis,
                      dialogues: e.target.value.split('\n').filter(Boolean)
                    })}
                    className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none"
                    placeholder="Une réplique par ligne..."
                  />
                ) : (
                  <ul className="space-y-1.5">
                    {editedAnalysis.dialogues?.map((dia, i) => (
                      <li key={i} className="text-xs text-white/90 italic flex items-start gap-2">
                        <span className="text-amber-400 not-italic">«</span>
                        <span>{dia}</span>
                        <span className="text-amber-400 not-italic">»</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <Heart className="w-4 h-4" />
                    <span>Émotions & Ambiance</span>
                  </h4>
                </div>
                
                <div className="mb-3">
                  <span className="text-[10px] text-white/40 uppercase font-mono block mb-1">Atmosphère Globale :</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedAnalysis.ambiance || ''}
                      onChange={(e) => setEditedAnalysis({ ...editedAnalysis, ambiance: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white"
                    />
                  ) : (
                    <p className="text-xs text-white/80">{editedAnalysis.ambiance || 'Non spécifiée'}</p>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-white/40 uppercase font-mono block mb-1.5">Palette Émotionnelle :</span>
                  <div className="flex flex-wrap gap-1.5">
                    {editedAnalysis.emotions?.map((emo, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-medium"
                      >
                        {emo}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
