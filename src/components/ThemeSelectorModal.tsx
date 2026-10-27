import React, { useState } from 'react';
import { THEMES } from '../data/themes';
import { ThemeConfig } from '../types';
import { Palette, X, Check, Edit3 } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeConfig;
  onSelectTheme: (theme: ThemeConfig) => void;
  appTitle: string;
  onUpdateTitle: (title: string) => void;
  appSubtitle: string;
  onUpdateSubtitle: (sub: string) => void;
}

export const ThemeSelectorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  appTitle,
  onUpdateTitle,
  appSubtitle,
  onUpdateSubtitle,
}) => {
  const [tempTitle, setTempTitle] = useState(appTitle);
  const [tempSubtitle, setTempSubtitle] = useState(appSubtitle);

  if (!isOpen) return null;

  const handleSave = () => {
    soundManager.playClick();
    onUpdateTitle(tempTitle.trim() || 'Sorteio de Apresentações');
    onUpdateSubtitle(tempSubtitle.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Personalização Visual & Título
            </h3>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Title settings */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                Título da Sessão / Turma
              </label>
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                placeholder="Ex: Apresentações Finais - Módulo de Projetos"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-400 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Subtítulo ou Instrução Adicional (opcional)
              </label>
              <input
                type="text"
                value={tempSubtitle}
                onChange={(e) => setTempSubtitle(e.target.value)}
                placeholder="Ex: Sala 204 • Duração máxima: 10 min por aluno"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-400 dark:text-white"
              />
            </div>
          </div>

          {/* Color Palettes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Escolher Paleta de Cores
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {THEMES.map((theme) => {
                const isSelected = theme.id === currentTheme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      soundManager.playClick();
                      onSelectTheme(theme);
                    }}
                    className={`relative p-3 rounded-xl border text-left transition-all flex flex-col items-start gap-2.5 ${
                      isSelected
                        ? 'border-slate-900 dark:border-white shadow-xs bg-slate-50/80 dark:bg-slate-800'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        className="w-6 h-6 rounded-full shadow-xs flex items-center justify-center"
                        style={{ backgroundColor: theme.primary }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </div>
                      <div className="flex gap-1">
                        {theme.confettiColors.slice(0, 3).map((c, i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        {theme.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition-opacity hover:opacity-90"
            style={{ backgroundColor: currentTheme.primary }}
          >
            Guardar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};
