export type ParticipantCondition = 'none' | 'first' | 'last' | 'not_first' | 'not_last' | 'exact';

export interface Participant {
  id: string;
  name: string;
  condition: ParticipantCondition;
  exactPosition?: number; // 1-indexed position when condition is 'exact'
  notes?: string;
}

export type QuoteStyle = 'as_nove' | 'joana_marques' | 'santos_populares' | 'random';

export interface Quote {
  id: string;
  text: string;
  authorNote: string;
  style: 'as_nove' | 'joana_marques' | 'santos_populares';
}

export interface DrawnResult {
  order: number;
  participant: Participant;
  drawnAt: string;
  quote?: Quote;
}

export type DrawMode = 'individual' | 'global';

export interface ThemeConfig {
  id: string;
  name: string;
  primary: string; // e.g. '#4f46e5'
  primaryHover: string;
  accentBg: string;
  cardBorder: string;
  badgeBg: string;
  badgeText: string;
  gradient: string;
  confettiColors: string[];
}
