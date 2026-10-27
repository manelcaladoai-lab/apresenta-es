import React, { useState, useEffect, useRef } from 'react';
import { Participant, DrawnResult, QuoteStyle, Quote } from '../types';
import { getRandomQuote } from '../data/quotes';
import { getEligibleNextCandidate } from '../utils/lottery';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  RotateCcw,
  Undo2,
  CheckCircle2,
  Trophy,
  Users,
  Flame,
  Volume2,
  VolumeX,
  Quote as QuoteIcon,
  HelpCircle,
  Clock,
  Shuffle
} from 'lucide-react';

interface Props {
  participants: Participant[];
  accentColor: string;
  confettiColors: string[];
  themeGradient: string;
  quoteStyle: QuoteStyle;
  enableQuotes: boolean;
  onQuoteStyleChange: (s: QuoteStyle) => void;
  onEnableQuotesChange: (enabled: boolean) => void;
}

export const IndividualDrawView: React.FC<Props> = ({
  participants,
  accentColor,
  confettiColors,
  themeGradient,
  quoteStyle,
  enableQuotes,
  onQuoteStyleChange,
  onEnableQuotesChange
}) => {
  // Pot holds participants not yet drawn or confirmed
  const [pot, setPot] = useState<Participant[]>([]);
  // History of confirmed drawn results
  const [drawnList, setDrawnList] = useState<DrawnResult[]>([]);
  // Current active candidate awaiting confirmation or return to pot
  const [currentCandidate, setCurrentCandidate] = useState<Participant | null>(null);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  // Animation state
  const [isSpinning, setIsSpinning] = useState(false);
  const [rollingName, setRollingName] = useState<string>('Pronto para sortear');
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Sync pot when participants list changes and no draw has happened
  useEffect(() => {
    if (drawnList.length === 0 && !currentCandidate) {
      setPot(participants);
    }
  }, [participants, drawnList.length, currentCandidate]);

  // Restart draw
  const handleResetDraw = () => {
    if (drawnList.length > 0 || currentCandidate) {
      if (window.confirm('Deseja reiniciar o sorteio individual? O progresso atual será limpo e todos os alunos voltam ao pote.')) {
        soundManager.playClick();
        setPot(participants);
        setDrawnList([]);
        setCurrentCandidate(null);
        setCurrentQuote(null);
        setIsSpinning(false);
        setRollingName('Pronto para sortear');
        setFeedbackBanner('Sorteio reiniciado. Todos os participantes estão de volta ao pote.');
      }
    }
  };

  // Launch Individual Spin with suspense & deceleration
  const handleStartSpin = () => {
    if (isSpinning) return;
    if (pot.length === 0) {
      alert('Não há mais formandos no pote!');
      return;
    }

    soundManager.playClick();
    setIsSpinning(true);
    setFeedbackBanner(null);

    const currentOrder = drawnList.length + 1;
    const { candidate } = getEligibleNextCandidate(pot, currentOrder, participants.length);

    // Prepare candidate quote if enabled
    const quote = enableQuotes ? getRandomQuote(quoteStyle) : null;

    // Simulation of mechanical spinning with progressive slowing down
    let counter = 0;
    const totalSteps = 26; // number of ticks
    let delay = 50;

    const tick = () => {
      counter++;
      // Pick random name from pot for visual roll
      const randomIdx = Math.floor(Math.random() * pot.length);
      setRollingName(pot[randomIdx].name);

      // Play sound tick with varying pitch
      soundManager.playTick(1.0 + (counter / totalSteps) * 0.4);

      if (counter < totalSteps) {
        // Slow down exponentially towards the end
        if (counter > totalSteps - 10) {
          delay += 35;
        } else if (counter > totalSteps - 16) {
          delay += 18;
        } else {
          delay += 6;
        }
        setTimeout(tick, delay);
      } else {
        // Final reveal!
        setRollingName(candidate.name);
        setCurrentCandidate(candidate);
        setCurrentQuote(quote);
        setIsSpinning(false);

        // Sound fanfare & Confetti!
        soundManager.playFanfare();
        triggerConfetti(confettiColors);
      }
    };

    setTimeout(tick, delay);
  };

  // Trigger celebration confetti
  const triggerConfetti = (colors: string[]) => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: colors.length > 0 ? colors : undefined,
        disableForReducedMotion: true
      });
    } catch {}
  };

  // Confirm presentation and advance to next order
  const handleConfirmCandidate = () => {
    if (!currentCandidate) return;
    soundManager.playClick();

    const orderNumber = drawnList.length + 1;
    const newResult: DrawnResult = {
      order: orderNumber,
      participant: currentCandidate,
      drawnAt: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      quote: currentQuote || undefined
    };

    // Remove from pot
    setPot(pot.filter((p) => p.id !== currentCandidate.id));
    setDrawnList([...drawnList, newResult]);
    setCurrentCandidate(null);
    setCurrentQuote(null);
    setRollingName('Vaga confirmada!');

    setFeedbackBanner(
      `Confirmado: ${currentCandidate.name} registado como ${orderNumber}º a apresentar.`
    );
  };

  // Re-send to the pot ("Voltar a enviar para o pote")
  const handleReturnToPot = () => {
    if (!currentCandidate) return;

    soundManager.playReturnToPot();
    const candidateName = currentCandidate.name;

    // Notice: candidate remains in pot!
    setCurrentCandidate(null);
    setCurrentQuote(null);
    setRollingName('Pronto para novo sorteio');

    setFeedbackBanner(
      `${candidateName} voltou a ser colocado no pote! Pode realizar novo sorteio para a vaga ${drawnList.length + 1}.`
    );
  };

  const currentOrderNumber = drawnList.length + 1;
  const isFinished = participants.length > 0 && pot.length === 0 && !currentCandidate;

  return (
    <div className="space-y-6">
      {/* Settings Bar: Motivational Quotes & Sound */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Quotes Controls */}
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
              Atribuir Frase Motivacional no Sorteio
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

        {/* Status / Reset */}
        <div className="flex items-center gap-3 self-end md:self-auto text-xs">
          <span className="text-slate-500">
            Pote: <strong className="text-slate-900 dark:text-white">{pot.length}</strong> restantes
          </span>
          {drawnList.length > 0 && (
            <button
              onClick={handleResetDraw}
              className="px-2.5 py-1 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-200 transition-colors flex items-center gap-1 text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              Reiniciar
            </button>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackBanner && (
        <div className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-between animate-in fade-in">
          <span>{feedbackBanner}</span>
          <button
            onClick={() => setFeedbackBanner(null)}
            className="text-slate-400 hover:text-slate-600 ml-2 text-xs"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Stage: Roulette & Drawing Pod */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden p-6 sm:p-10 text-center">
        {/* Background glow matching theme */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />

        {/* Current status header */}
        <div className="relative z-10 flex flex-col items-center justify-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {isFinished
                ? 'Sorteio Concluído!'
                : `A sortear para o ${currentOrderNumber}º lugar de apresentação`}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            {isFinished
              ? 'Todos os participantes foram sorteados e confirmados.'
              : `${pot.length} candidatos disponíveis no pote digital`}
          </p>
        </div>

        {/* Stage Center: Big display */}
        {!currentCandidate ? (
          <div className="relative z-10 py-8 px-4 flex flex-col items-center justify-center space-y-6">
            {/* Spinning name display box */}
            <div
              className={`w-full max-w-xl py-8 px-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center min-h-[140px] ${
                isSpinning
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-lg scale-105'
                  : 'border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
              }`}
            >
              <div
                className={`text-2xl sm:text-4xl font-extrabold tracking-tight transition-all ${
                  isSpinning
                    ? 'text-indigo-600 dark:text-indigo-400 blur-[0.3px]'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {rollingName}
              </div>
              {isSpinning && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-indigo-500 font-medium animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  A baralhar o pote com as condições aplicadas...
                </div>
              )}
            </div>

            {/* Draw Button */}
            {!isFinished ? (
              <button
                type="button"
                onClick={handleStartSpin}
                disabled={isSpinning || pot.length === 0}
                className="group relative px-8 py-4 rounded-2xl text-base sm:text-lg font-bold text-white shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-3"
                style={{ backgroundColor: accentColor }}
              >
                <Shuffle className={`w-5 h-5 ${isSpinning ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                <span>
                  {isSpinning ? 'A Sortear...' : `Sortear ${currentOrderNumber}º Apresentador`}
                </span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Parabéns! Todos os alunos foram sorteados e ordenados com sucesso.
              </div>
            )}
          </div>
        ) : (
          /* Winner Revealed Card with Quote and Decision Buttons */
          <div className="relative z-10 max-w-xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
            <div className="p-6 sm:p-8 rounded-3xl border-2 border-emerald-400 dark:border-emerald-600 bg-white dark:bg-slate-800 shadow-xl space-y-5">
              {/* Placement badge */}
              <div className="flex items-center justify-center">
                <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 flex items-center gap-1.5 shadow-xs">
                  <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {currentOrderNumber}º Apresentador
                </span>
              </div>

              {/* Name */}
              <div>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {currentCandidate.name}
                </h3>
                {currentCandidate.condition !== 'none' && (
                  <p className="text-xs text-slate-500 mt-2">
                    Condição aplicada:{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {currentCandidate.condition === 'first' && 'Preferência no Início'}
                      {currentCandidate.condition === 'last' && 'Preferência para o Fim'}
                      {currentCandidate.condition === 'exact' && `Posição Fixa (#${currentCandidate.exactPosition})`}
                      {currentCandidate.condition === 'not_first' && 'Restrição: Não primeiro'}
                      {currentCandidate.condition === 'not_last' && 'Restrição: Não último'}
                    </span>
                    {currentCandidate.notes && ` (${currentCandidate.notes})`}
                  </p>
                )}
              </div>

              {/* Motivational Quote Box */}
              {currentQuote && (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-left space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <QuoteIcon className="w-3.5 h-3.5" />
                      {currentQuote.authorNote}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic leading-relaxed whitespace-pre-line">
                    &ldquo;{currentQuote.text}&rdquo;
                  </p>
                </div>
              )}

              {/* Decision Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                {/* Return to Pot button */}
                <button
                  type="button"
                  onClick={handleReturnToPot}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  title="Devolver este nome para o pote se não puder apresentar agora"
                >
                  <Undo2 className="w-4 h-4" />
                  Voltar a Enviar para o Pote
                </button>

                {/* Confirm Presentation */}
                <button
                  type="button"
                  onClick={handleConfirmCandidate}
                  className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer"
                  style={{ backgroundColor: accentColor }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmar e Registar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress & History of Drawn Participants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Confirmed Drawn Order */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Ordem Confirmada ({drawnList.length}/{participants.length})
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              {Math.round((drawnList.length / (participants.length || 1)) * 100)}% concluído
            </span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[260px] divide-y divide-slate-100 dark:divide-slate-800">
            {drawnList.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                Ainda não há apresentações sorteadas. Clique em &quot;Sortear&quot; acima.
              </p>
            ) : (
              drawnList.map((item) => (
                <div
                  key={item.participant.id}
                  className="pt-2 pb-1.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-[11px]">
                      {item.order}º
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.participant.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{item.drawnAt}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Current Remaining in Pot */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              Ainda no Pote ({pot.length})
            </h3>
            <span className="text-[11px] text-slate-400">À espera de vez</span>
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[260px]">
            {pot.length === 0 ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 py-8 text-center font-medium">
                Pote vazio! Todos os formandos já foram sorteados.
              </p>
            ) : (
              pot.map((p) => (
                <div
                  key={p.id}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs flex items-center justify-between"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                    {p.name}
                  </span>
                  {p.condition !== 'none' && (
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60">
                      {p.condition === 'first' && 'Início'}
                      {p.condition === 'last' && 'Fim'}
                      {p.condition === 'exact' && `#${p.exactPosition}`}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
