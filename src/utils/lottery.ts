import { Participant, DrawnResult } from '../types';

/**
 * Modern Fisher-Yates shuffle
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Solves a complete global draw for all participants honoring conditions:
 * - 'exact': fixed position (1-based)
 * - 'first': early positions
 * - 'last': late positions
 * - 'not_first': cannot be #1
 * - 'not_last': cannot be #N
 */
export function generateGlobalDraw(participants: Participant[]): Participant[] {
  const total = participants.length;
  if (total <= 1) return [...participants];

  const result: (Participant | null)[] = new Array(total).fill(null);
  const remaining: Participant[] = [];

  // 1. Place exact positions first
  const exacts = participants.filter((p) => p.condition === 'exact' && p.exactPosition && p.exactPosition >= 1);
  for (const p of exacts) {
    let targetIdx = (p.exactPosition! - 1);
    if (targetIdx >= total) targetIdx = total - 1;
    if (targetIdx < 0) targetIdx = 0;

    // Find nearest free slot if occupied
    while (result[targetIdx] !== null && targetIdx < total - 1) {
      targetIdx++;
    }
    if (result[targetIdx] !== null) {
      targetIdx = 0;
      while (result[targetIdx] !== null && targetIdx < total) {
        targetIdx++;
      }
    }
    if (targetIdx < total) {
      result[targetIdx] = p;
    } else {
      remaining.push(p);
    }
  }

  // 2. Identify remaining groups
  const placedIds = new Set(result.filter(Boolean).map((p) => p!.id));
  const unplaced = participants.filter((p) => !placedIds.has(p.id));

  const firstGroup = shuffleArray(unplaced.filter((p) => p.condition === 'first'));
  const lastGroup = shuffleArray(unplaced.filter((p) => p.condition === 'last'));
  const neutralGroup = shuffleArray(
    unplaced.filter((p) => p.condition !== 'first' && p.condition !== 'last')
  );

  // 3. Fill firstGroup in earliest available slots
  for (const p of firstGroup) {
    const freeIdx = result.findIndex((slot) => slot === null);
    if (freeIdx !== -1) {
      result[freeIdx] = p;
    }
  }

  // 4. Fill lastGroup in latest available slots
  for (const p of lastGroup) {
    let lastFreeIdx = -1;
    for (let i = total - 1; i >= 0; i--) {
      if (result[i] === null) {
        lastFreeIdx = i;
        break;
      }
    }
    if (lastFreeIdx !== -1) {
      result[lastFreeIdx] = p;
    }
  }

  // 5. Fill remaining neutral candidates in remaining slots
  for (const p of neutralGroup) {
    const freeIdx = result.findIndex((slot) => slot === null);
    if (freeIdx !== -1) {
      result[freeIdx] = p;
    }
  }

  // Fallback for any unplaced due to edge collisions
  for (const p of remaining) {
    const freeIdx = result.findIndex((slot) => slot === null);
    if (freeIdx !== -1) {
      result[freeIdx] = p;
    }
  }

  // Post-adjustment: verify 'not_first' and 'not_last'
  const final = result.map((p, idx) => p || participants[idx]);

  if (final.length > 1 && final[0].condition === 'not_first') {
    const swapIdx = final.findIndex((p, idx) => idx > 0 && p.condition !== 'not_first' && p.condition !== 'first');
    if (swapIdx !== -1) {
      [final[0], final[swapIdx]] = [final[swapIdx], final[0]];
    }
  }

  if (final.length > 1 && final[final.length - 1].condition === 'not_last') {
    const swapIdx = final.findIndex(
      (p, idx) => idx < final.length - 1 && p.condition !== 'not_last' && p.condition !== 'last'
    );
    if (swapIdx !== -1) {
      [final[final.length - 1], final[swapIdx]] = [final[swapIdx], final[final.length - 1]];
    }
  }

  return final;
}

/**
 * Evaluates the next eligible candidate from the remaining pot during individual draw.
 */
export function getEligibleNextCandidate(
  pot: Participant[],
  currentOrder: number, // 1-based order of this draw
  totalInitial: number
): { candidate: Participant; candidatesPool: Participant[] } {
  if (pot.length === 1) {
    return { candidate: pot[0], candidatesPool: [pot[0]] };
  }

  // 1. Check if any participant has an exact position matching currentOrder
  const exactMatch = pot.filter((p) => p.condition === 'exact' && p.exactPosition === currentOrder);
  if (exactMatch.length > 0) {
    const chosen = shuffleArray(exactMatch)[0];
    return { candidate: chosen, candidatesPool: exactMatch };
  }

  // 2. Check if there are participants with 'first' condition
  const firsts = pot.filter((p) => p.condition === 'first');
  if (firsts.length > 0) {
    const chosen = shuffleArray(firsts)[0];
    return { candidate: chosen, candidatesPool: firsts };
  }

  // 3. Count remaining positions
  const remainingCount = pot.length;
  const lasts = pot.filter((p) => p.condition === 'last');

  // If the number of remaining spots is equal to the number of 'last' candidates,
  // then we MUST pick from the 'last' candidates now!
  if (lasts.length >= remainingCount) {
    const chosen = shuffleArray(lasts)[0];
    return { candidate: chosen, candidatesPool: lasts };
  }

  // Otherwise, filter OUT the 'last' candidates so they stay in the pot for later
  let eligible = pot.filter((p) => p.condition !== 'last');

  // If currentOrder === 1, filter out 'not_first' if there are alternatives
  if (currentOrder === 1) {
    const nonNotFirst = eligible.filter((p) => p.condition !== 'not_first');
    if (nonNotFirst.length > 0) {
      eligible = nonNotFirst;
    }
  }

  // If currentOrder === totalInitial, filter out 'not_last' if possible
  if (currentOrder === totalInitial) {
    const nonNotLast = eligible.filter((p) => p.condition !== 'not_last');
    if (nonNotLast.length > 0) {
      eligible = nonNotLast;
    }
  }

  if (eligible.length === 0) {
    eligible = pot;
  }

  const chosen = shuffleArray(eligible)[0];
  return { candidate: chosen, candidatesPool: eligible };
}

export const SAMPLE_PARTICIPANTS: Participant[] = [
  { id: '1', name: 'Ana Beatriz Ramos', condition: 'first', notes: 'Tem consulta médica às 11h' },
  { id: '2', name: 'Bernardo Guimarães', condition: 'none' },
  { id: '3', name: 'Carolina Vasconcelos', condition: 'none' },
  { id: '4', name: 'Diogo Figueiredo', condition: 'none' },
  { id: '5', name: 'Eduardo Fontes', condition: 'not_first' },
  { id: '6', name: 'Francisca Lourenço', condition: 'none' },
  { id: '7', name: 'Gonçalo Silveira', condition: 'last', notes: 'Chega mais tarde de estágio' },
  { id: '8', name: 'Helena Matos', condition: 'none' },
  { id: '9', name: 'Inês Carvalhal', condition: 'none' },
  { id: '10', name: 'João Miguel Esteves', condition: 'none' },
  { id: '11', name: 'Laura Mendonça', condition: 'none' },
  { id: '12', name: 'Manuel Peixoto', condition: 'last', notes: 'Ajuste de apresentação' }
];
