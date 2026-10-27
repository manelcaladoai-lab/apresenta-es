import React, { useState } from 'react';
import { AS_NOVE_QUOTES, JOANA_MARQUES_QUOTES, SANTOS_POPULARES_QUOTES } from '../data/quotes';
import { Quote } from '../types';
import { BookOpen, X, Search, Sparkles, Heart, Smile, Music } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  accentColor: string;
}

export const QuotesModal: React.FC<Props> = ({ isOpen, onClose, accentColor }) => {
  const [activeTab, setActiveTab] = useState<'as_nove' | 'joana_marques' | 'santos_populares'>('as_nove');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const getQuotesList = (): Quote[] => {
    let list: Quote[] = [];
    if (activeTab === 'as_nove') list = AS_NOVE_QUOTES;
    if (activeTab === 'joana_marques') list = JOANA_MARQUES_QUOTES;
    if (activeTab === 'santos_populares') list = SANTOS_POPULARES_QUOTES;

    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter((q) => q.text.toLowerCase().includes(term));
  };

  const quotes = getQuotesList();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Biblioteca de Frases Motivacionais & Humor
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mais de 120 frases catalogadas para animar e descontrair a apresentação
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('as_nove');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'as_nove'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              As Nove ({AS_NOVE_QUOTES.length})
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('joana_marques');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'joana_marques'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smile className="w-3.5 h-3.5 text-amber-500" />
              Joana Marques ({JOANA_MARQUES_QUOTES.length})
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('santos_populares');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'santos_populares'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Music className="w-3.5 h-3.5 text-emerald-500" />
              Santos Populares ({SANTOS_POPULARES_QUOTES.length})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar frase..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:text-white"
            />
          </div>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {quotes.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-400">
              Nenhuma frase encontrada para &quot;{searchTerm}&quot;.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quotes.map((quote, idx) => (
                <div
                  key={quote.id}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all flex flex-col justify-between"
                >
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed italic whitespace-pre-line mb-3">
                    &ldquo;{quote.text}&rdquo;
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200/50 dark:border-slate-700/50 pt-2">
                    <span>#{idx + 1}</span>
                    <span className="font-medium text-slate-500 dark:text-slate-400">
                      {quote.authorNote}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Total disponível: 126 frases temáticas</span>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs"
            style={{ backgroundColor: accentColor }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
