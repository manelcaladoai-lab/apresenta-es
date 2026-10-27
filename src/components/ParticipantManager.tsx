import React, { useState } from 'react';
import { Participant, ParticipantCondition } from '../types';
import { SAMPLE_PARTICIPANTS } from '../utils/lottery';
import { soundManager } from '../utils/audio';
import {
  Users,
  UserPlus,
  ClipboardList,
  Trash2,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  AlertCircle,
  Clock,
  ArrowUpCircle,
  ArrowDownCircle,
  Target
} from 'lucide-react';

interface Props {
  participants: Participant[];
  onUpdateParticipants: (list: Participant[]) => void;
  accentColor: string;
}

export const ParticipantManager: React.FC<Props> = ({
  participants,
  onUpdateParticipants,
  accentColor
}) => {
  const [pasteText, setPasteText] = useState('');
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [singleName, setSingleName] = useState('');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);

  // Bulk add names
  const handleBulkAdd = () => {
    if (!pasteText.trim()) return;
    soundManager.playClick();

    // Split by newlines, commas, or semicolons
    const rawNames = pasteText
      .split(/[\n,;]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    const newItems: Participant[] = rawNames.map((name, idx) => ({
      id: `p-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      condition: 'none'
    }));

    onUpdateParticipants([...participants, ...newItems]);
    setPasteText('');
    setIsBulkOpen(false);
  };

  // Add single name
  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleName.trim()) return;
    soundManager.playClick();

    const newItem: Participant = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: singleName.trim(),
      condition: 'none'
    };

    onUpdateParticipants([...participants, newItem]);
    setSingleName('');
  };

  // Remove participant
  const handleRemove = (id: string) => {
    soundManager.playClick();
    onUpdateParticipants(participants.filter((p) => p.id !== id));
  };

  // Update condition
  const handleConditionChange = (id: string, condition: ParticipantCondition) => {
    soundManager.playClick();
    onUpdateParticipants(
      participants.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            condition,
            exactPosition: condition === 'exact' ? p.exactPosition || 1 : undefined
          };
        }
        return p;
      })
    );
  };

  // Update exact position
  const handleExactPositionChange = (id: string, pos: number) => {
    const clamped = Math.max(1, Math.min(pos, participants.length));
    onUpdateParticipants(
      participants.map((p) => {
        if (p.id === id) {
          return { ...p, exactPosition: clamped };
        }
        return p;
      })
    );
  };

  // Update notes
  const handleNotesChange = (id: string, notes: string) => {
    onUpdateParticipants(
      participants.map((p) => (p.id === id ? { ...p, notes } : p))
    );
  };

  // Load sample turma
  const handleLoadSample = () => {
    soundManager.playClick();
    onUpdateParticipants(
      SAMPLE_PARTICIPANTS.map((p) => ({
        ...p,
        id: `sample-${p.id}-${Date.now()}`
      }))
    );
  };

  // Clear all
  const handleClearAll = () => {
    if (participants.length === 0) return;
    if (window.confirm('Tem a certeza de que deseja limpar todos os participantes da lista?')) {
      soundManager.playClick();
      onUpdateParticipants([]);
    }
  };

  // Count conditions
  const countFirst = participants.filter((p) => p.condition === 'first').length;
  const countLast = participants.filter((p) => p.condition === 'last').length;
  const countExact = participants.filter((p) => p.condition === 'exact').length;
  const countOther = participants.filter(
    (p) => p.condition === 'not_first' || p.condition === 'not_last'
  ).length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
      {/* Header & Quick stats */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
            style={{ backgroundColor: accentColor }}
          >
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Alunos & Formandos
              <span className="text-xs font-normal text-slate-400">
                ({participants.length} inscritos)
              </span>
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              <span>{countFirst} no início</span>
              <span>·</span>
              <span>{countLast} no fim</span>
              {countExact > 0 && (
                <>
                  <span>·</span>
                  <span>{countExact} fixados</span>
                </>
              )}
              {countOther > 0 && (
                <>
                  <span>·</span>
                  <span>{countOther} restrições</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleLoadSample}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            title="Carregar turma fictícia para teste imediato"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Exemplo
          </button>
          <button
            type="button"
            onClick={() => setIsBulkOpen(!isBulkOpen)}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
            Colar Lista
          </button>
          {participants.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
              title="Limpar todos"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bulk Paste Box (Collapsible) */}
      {isBulkOpen && (
        <div className="p-4 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Colar nomes em bloco (um por linha, ou separados por vírgulas):
              </label>
              <span className="text-[11px] text-slate-400">
                Pode colar diretamente do Excel, Word ou bloco de notas
              </span>
            </div>
            <textarea
              rows={4}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Maria Silva&#10;João Santos&#10;Beatriz Costa&#10;Pedro Ferreira..."
              className="w-full p-3 text-xs sm:text-sm font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-400 dark:text-white resize-y"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsBulkOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleBulkAdd}
                disabled={!pasteText.trim()}
                className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg shadow-xs transition-opacity disabled:opacity-50"
                style={{ backgroundColor: accentColor }}
              >
                Adicionar {pasteText.trim() ? `(${pasteText.split(/[\n,;]+/).filter(Boolean).length}) Nomes` : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Form */}
      <form
        onSubmit={handleAddSingle}
        className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/40 dark:bg-slate-900/40"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={singleName}
            onChange={(e) => setSingleName(e.target.value)}
            placeholder="Nome do formando ou aluno..."
            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-400 dark:text-white"
          />
        </div>
        <button
          type="submit"
          disabled={!singleName.trim()}
          className="px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs transition-opacity disabled:opacity-50 flex items-center gap-1.5 shrink-0"
          style={{ backgroundColor: accentColor }}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Adicionar</span>
        </button>
      </form>

      {/* Participants List */}
      <div className="p-3 sm:p-4 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto max-h-[380px]">
        {participants.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Ainda não adicionou nenhum formando
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Escreva um nome acima, cole a lista da turma em bloco ou clique em &quot;Exemplo&quot; para testar imediatamente.
              </p>
            </div>
          </div>
        ) : (
          participants.map((p, idx) => {
            const hasCondition = p.condition !== 'none';
            return (
              <div
                key={p.id}
                className="py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group"
              >
                {/* Name & index */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[11px] font-mono text-slate-400 w-5 shrink-0 text-right">
                    {idx + 1}.
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 truncate block">
                      {p.name}
                    </span>
                    {p.notes && (
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 block truncate">
                        Motivo: {p.notes}
                      </span>
                    )}
                  </div>
                </div>

                {/* Condition Controls */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pl-7 sm:pl-0">
                  {/* Condition Selector */}
                  <div className="relative">
                    <select
                      value={p.condition}
                      onChange={(e) =>
                        handleConditionChange(p.id, e.target.value as ParticipantCondition)
                      }
                      className={`text-xs pl-2.5 pr-7 py-1 rounded-lg border appearance-none font-medium transition-colors cursor-pointer ${
                        p.condition === 'first'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                          : p.condition === 'last'
                          ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                          : p.condition === 'exact'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-300'
                          : p.condition === 'not_first' || p.condition === 'not_last'
                          ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-300'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <option value="none">Sem restrição</option>
                      <option value="first">No início (primeiros)</option>
                      <option value="last">Para o fim (últimos)</option>
                      <option value="exact">Posição fixa exata...</option>
                      <option value="not_first">Não pode ser o 1º</option>
                      <option value="not_last">Não pode ser o último</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* If exact condition, number input */}
                  {p.condition === 'exact' && (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        max={participants.length}
                        value={p.exactPosition || 1}
                        onChange={(e) =>
                          handleExactPositionChange(p.id, parseInt(e.target.value, 10) || 1)
                        }
                        className="w-14 px-2 py-1 text-xs text-center font-mono font-bold bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 rounded-lg focus:outline-hidden"
                        title="Posição exata no sorteio"
                      />
                      <span className="text-[11px] text-slate-400">º lugar</span>
                    </div>
                  )}

                  {/* Notes button */}
                  <button
                    type="button"
                    onClick={() => {
                      const newNote = prompt('Nota ou motivo da condição para este formando:', p.notes || '');
                      if (newNote !== null) {
                        handleNotesChange(p.id, newNote.trim());
                      }
                    }}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      p.notes
                        ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={p.notes ? `Nota: ${p.notes}` : 'Adicionar nota explicativa'}
                  >
                    <Clock className="w-3.5 h-3.5" />
                  </button>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(p.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 text-slate-400 shrink-0" />
          As restrições de início, fim e posições fixas são respeitadas rigorosamente em ambos os sorteios.
        </span>
        <span className="shrink-0">{participants.length} total</span>
      </div>
    </div>
  );
};
