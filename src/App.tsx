import React, { useState, useEffect } from 'react';
import { Participant, DrawMode, QuoteStyle, ThemeConfig } from './types';
import { THEMES, getTheme } from './data/themes';
import { SAMPLE_PARTICIPANTS } from './utils/lottery';
import { soundManager } from './utils/audio';
import { ParticipantManager } from './components/ParticipantManager';
import { IndividualDrawView } from './components/IndividualDrawView';
import { GlobalDrawView } from './components/GlobalDrawView';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { QuotesModal } from './components/QuotesModal';
import {
  Sparkles,
  Shuffle,
  ListOrdered,
  Palette,
  Volume2,
  VolumeX,
  BookOpen,
  Edit2,
  Share2
} from 'lucide-react';

export default function App() {
  // App Title and Subtitle with localStorage persistence
  const [appTitle, setAppTitle] = useState<string>(() => {
    try {
      return localStorage.getItem('app_title') || 'Sorteio de Apresentações';
    } catch {
      return 'Sorteio de Apresentações';
    }
  });

  const [appSubtitle, setAppSubtitle] = useState<string>(() => {
    try {
      return (
        localStorage.getItem('app_subtitle') ||
        'Sorteio transparente de ordem de trabalho com condições personalizadas'
      );
    } catch {
      return 'Sorteio transparente de ordem de trabalho com condições personalizadas';
    }
  });

  // Current Theme
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(() => {
    try {
      const savedThemeId = localStorage.getItem('app_theme_id');
      return getTheme(savedThemeId || 'indigo');
    } catch {
      return THEMES[0];
    }
  });

  // Sound Muted state
  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.getMuted());

  // Draw Mode: 'individual' | 'global'
  const [drawMode, setDrawMode] = useState<DrawMode>('individual');

  // Quotes Configuration
  const [enableQuotes, setEnableQuotes] = useState<boolean>(true);
  const [quoteStyle, setQuoteStyle] = useState<QuoteStyle>('as_nove');

  // Participants list with localStorage persistence
  const [participants, setParticipants] = useState<Participant[]>(() => {
    try {
      const saved = localStorage.getItem('app_participants');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SAMPLE_PARTICIPANTS;
  });

  // Modals
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isQuotesModalOpen, setIsQuotesModalOpen] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('app_title', appTitle);
    } catch {}
  }, [appTitle]);

  useEffect(() => {
    try {
      localStorage.setItem('app_subtitle', appSubtitle);
    } catch {}
  }, [appSubtitle]);

  useEffect(() => {
    try {
      localStorage.setItem('app_theme_id', currentTheme.id);
    } catch {}
  }, [currentTheme]);

  useEffect(() => {
    try {
      localStorage.setItem('app_participants', JSON.stringify(participants));
    } catch {}
  }, [participants]);

  const toggleSound = () => {
    const newState = soundManager.toggleMute();
    setIsMuted(newState);
    if (!newState) {
      soundManager.playClick();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Bar Contract: 1-line wordmark, 4-5 nav links, 1 primary action */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs font-black text-sm"
              style={{ backgroundColor: currentTheme.primary }}
            >
              SP
            </div>
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              Sorteio de Apresentações
            </span>
          </div>

          {/* Zone 2: Navigation Links / View Switcher */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => {
                soundManager.playClick();
                setDrawMode('individual');
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                drawMode === 'individual'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              Sorteio Individual (Um a um)
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setDrawMode('global');
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                drawMode === 'global'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              Sorteio Global (Lista Completa)
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Sound, Theme, Quotes modal) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sound toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title={isMuted ? 'Ativar Efeitos Sonoros' : 'Silenciar Sons'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-500" />
              )}
            </button>

            {/* Motivational quotes library */}
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setIsQuotesModalOpen(true);
              }}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap"
              title="Ver todas as frases e piadas disponíveis"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Frases</span>
            </button>

            {/* Theme & Title Customizer */}
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setIsThemeModalOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white rounded-xl shadow-xs transition-opacity hover:opacity-95 flex items-center gap-1.5 whitespace-nowrap"
              style={{ backgroundColor: currentTheme.primary }}
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cores & Título</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Title Header with inline editing trigger */}
        <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 group">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {appTitle}
              </h1>
              <button
                type="button"
                onClick={() => setIsThemeModalOpen(true)}
                className="opacity-40 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-opacity"
                title="Editar título e subtítulo"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            {appSubtitle && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {appSubtitle}
              </p>
            )}
          </div>

          {/* Mobile View Switcher */}
          <div className="flex md:hidden items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl w-full">
            <button
              onClick={() => {
                soundManager.playClick();
                setDrawMode('individual');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                drawMode === 'individual'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              Individual
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setDrawMode('global');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                drawMode === 'global'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              Global
            </button>
          </div>
        </section>

        {/* 2-Column Responsive Layout: Management on Left/Side, Draw Arena on Right/Center */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Participant Management & Conditions (4 cols on desktop) */}
          <div className="lg:col-span-5 space-y-6">
            <ParticipantManager
              participants={participants}
              onUpdateParticipants={setParticipants}
              accentColor={currentTheme.primary}
            />

            {/* Quick guide card */}
            <div className="bg-slate-100/70 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <h4 className="font-semibold text-slate-900 dark:text-slate-200">
                Como funcionam as condições:
              </h4>
              <ul className="space-y-1.5 list-disc list-inside">
                <li>
                  <strong className="text-slate-800 dark:text-slate-300">No início:</strong>{' '}
                  Apresenta nos primeiros turnos do sorteio.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-300">Para o fim:</strong>{' '}
                  Permanece no pote até aos últimos lugares da sessão.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-300">Posição Fixa:</strong>{' '}
                  Atribui exatamente a ordem especificada.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-300">Reenviar ao pote:</strong>{' '}
                  No sorteio individual, se o formando sorteado não puder falar de imediato, pode reenviá-lo para novo sorteio.
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Draw Arena (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-6">
            {drawMode === 'individual' ? (
              <IndividualDrawView
                participants={participants}
                accentColor={currentTheme.primary}
                confettiColors={currentTheme.confettiColors}
                themeGradient={currentTheme.gradient}
                quoteStyle={quoteStyle}
                enableQuotes={enableQuotes}
                onQuoteStyleChange={setQuoteStyle}
                onEnableQuotesChange={setEnableQuotes}
              />
            ) : (
              <GlobalDrawView
                participants={participants}
                accentColor={currentTheme.primary}
                confettiColors={currentTheme.confettiColors}
                quoteStyle={quoteStyle}
                enableQuotes={enableQuotes}
                onQuoteStyleChange={setQuoteStyle}
                onEnableQuotesChange={setEnableQuotes}
                appTitle={appTitle}
                appSubtitle={appSubtitle}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Sorteio de Apresentações • Sistema Justo e Transparente</span>
          <span>126 Frases Motivacionais & Santos Populares integradas</span>
        </div>
      </footer>

      {/* Customization Modal */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
        appTitle={appTitle}
        onUpdateTitle={setAppTitle}
        appSubtitle={appSubtitle}
        onUpdateSubtitle={setAppSubtitle}
      />

      {/* Quotes Library Modal */}
      <QuotesModal
        isOpen={isQuotesModalOpen}
        onClose={() => setIsQuotesModalOpen(false)}
        accentColor={currentTheme.primary}
      />
    </div>
  );
}
