import React, { useState } from 'react';
import { Participant, QuoteStyle, Quote } from '../types';
import { generateGlobalDraw } from '../utils/lottery';
import { getRandomQuote } from '../data/quotes';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  ListOrdered,
  Shuffle,
  Copy,
  Check,
  Printer,
  Sparkles,
  Quote as QuoteIcon,
  Award,
  AlertCircle
} from 'lucide-react';

interface Props {
  participants: Participant[];
  accentColor: string;
  confettiColors: string[];
  quoteStyle: QuoteStyle;
  enableQuotes: boolean;
  onQuoteStyleChange: (s: QuoteStyle) => void;
  onEnableQuotesChange: (e: boolean) => void;
  appTitle: string;
  appSubtitle: string;
}

interface GlobalItem {
  order: number;
  participant: Participant;
  quote?: Quote;
}

export const GlobalDrawView: React.FC<Props> = ({
  participants,
  accentColor,
  confettiColors,
  quoteStyle,
  enableQuotes,
  onQuoteStyleChange,
  onEnableQuotesChange,
  appTitle,
  appSubtitle
}) => {
  const [orderedList, setOrderedList] = useState<GlobalItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Run full global lottery
  const handleGenerateGlobal = () => {
    if (participants.length === 0) return;

    soundManager.playClick();
    setIsGenerating(true);

    setTimeout(() => {
      const sortedParticipants = generateGlobalDraw(participants);
      const items: GlobalItem[] = sortedParticipants.map((p, idx) => ({
        order: idx + 1,
        participant: p,
        quote: enableQuotes ? getRandomQuote(quoteStyle) : undefined
      }));

      setOrderedList(items);
      setIsGenerating(false);
      soundManager.playFanfare();

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.5 },
          colors: confettiColors.length > 0 ? confettiColors : undefined,
          disableForReducedMotion: true
        });
      } catch {}
    }, 350);
  };

  // Copy cleanly to clipboard
  const handleCopyClipboard = () => {
    if (orderedList.length === 0) return;
    soundManager.playClick();

    const titleText = `${appTitle || 'Sorteio de Apresentações'}\n`;
    const subtitleText = appSubtitle ? `${appSubtitle}\n\n` : '\n';
    const lines = orderedList.map((item) => {
      let line = `${item.order}º lugar: ${item.participant.name}`;
      if (item.participant.condition !== 'none') {
        line += ` [Condição: ${item.participant.condition}]`;
      }
      if (item.quote) {
        line += `\n   » "${item.quote.text.replace(/\n/g, ' ')}"`;
      }
      return line;
    });

    const fullText = titleText + subtitleText + lines.join('\n\n');

    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Print
  const handlePrint = () => {
    soundManager.playClick();
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Quote settings */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={enableQuotes}
              onChange={(e) => {
                soundManager.playClick();
                onEnableQuotesChange(e.target.checked);
              }}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <QuoteIcon className="w-3.5 h-3.5 text-indigo-500" />
              Incluir Frase Motivacional em cada vaga
            </span>
          </label>

          {enableQuotes && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-400">Estilo:</span>
              <select
                value={quoteStyle}
                onChange={(e) => {
                  soundManager.playClick();
                  onQuoteStyleChange(e.target.value as QuoteStyle);
                }}
                className="text-xs py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                <option value="as_nove">1. Blog &quot;As Nove&quot; (Fofinhas & Afetuosas)</option>
                <option value="joana_marques">2. Joana Marques (Sarcasmo & Humor)</option>
                <option value="santos_populares">3. Quadra Popular (Santos Populares)</option>
                <option value="random">Baralhar entre os 3 Estilos</option>
              </select>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {orderedList.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleCopyClipboard}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                title="Copiar lista de ordem completa"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    Copiar Lista
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
                title="Imprimir ordem de apresentações"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                Imprimir
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleGenerateGlobal}
            disabled={participants.length === 0 || isGenerating}
            className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-opacity hover:opacity-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            style={{ backgroundColor: accentColor }}
          >
            <Shuffle className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{orderedList.length === 0 ? 'Sortear Lista Completa' : 'Re-Sortear Global'}</span>
          </button>
        </div>
      </div>

      {/* Main Ordered List Display */}
      {orderedList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-xs">
            <ListOrdered className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Sorteio Global Instantâneo
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            Clique no botão acima para baralhar todos os {participants.length} formandos de uma só vez,
            respeitando automaticamente todas as condições de início, fim e posições fixas definidas.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleGenerateGlobal}
              disabled={participants.length === 0}
              className="px-6 py-3 text-xs sm:text-sm font-bold text-white rounded-xl shadow-md transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: accentColor }}
            >
              Sortear Lista Completa Agora
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          {/* Header of the list */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Resultado Oficial
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
                Ordem Geral das Apresentações
              </h3>
              {appSubtitle && (
                <p className="text-xs text-slate-500 mt-1">{appSubtitle}</p>
              )}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Total: {orderedList.length} apresentadores
            </div>
          </div>

          {/* Items */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-4">
            {orderedList.map((item) => (
              <div
                key={item.participant.id}
                className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-3 rounded-xl transition-colors"
              >
                {/* Order & Participant Name */}
                <div className="flex items-start gap-3.5">
                  <div
                    className="w-8 h-8 rounded-xl font-mono font-bold text-xs flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: accentColor }}
                  >
                    {item.order}º
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {item.participant.name}
                      </span>
                      {item.participant.condition !== 'none' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.participant.condition === 'first' && 'Início'}
                          {item.participant.condition === 'last' && 'Fim'}
                          {item.participant.condition === 'exact' && `Fixado #${item.participant.exactPosition}`}
                        </span>
                      )}
                    </div>
                    {item.participant.notes && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Nota: {item.participant.notes}
                      </p>
                    )}

                    {/* Motivational Quote if present */}
                    {item.quote && (
                      <div className="mt-2.5 p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 max-w-xl text-left">
                        <p className="text-xs text-slate-800 dark:text-slate-200 italic whitespace-pre-line leading-relaxed">
                          &ldquo;{item.quote.text}&rdquo;
                        </p>
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold block mt-1">
                          — {item.quote.authorNote}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side helper info */}
                <div className="self-end sm:self-center text-right text-xs font-mono text-slate-400">
                  Lugar #{item.order}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
