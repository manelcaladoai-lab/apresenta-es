import { ThemeConfig } from '../types';

export const THEMES: ThemeConfig[] = [
  {
    id: 'indigo',
    name: 'Índigo Real',
    primary: '#4f46e5',
    primaryHover: '#4338ca',
    accentBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    cardBorder: 'border-indigo-200 dark:border-indigo-800/60',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-900/60',
    badgeText: 'text-indigo-800 dark:text-indigo-300',
    gradient: 'from-indigo-600 to-violet-600',
    confettiColors: ['#4f46e5', '#818cf8', '#c084fc', '#fbbf24', '#34d399', '#ffffff']
  },
  {
    id: 'emerald',
    name: 'Esmeralda Vital',
    primary: '#059669',
    primaryHover: '#047857',
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    cardBorder: 'border-emerald-200 dark:border-emerald-800/60',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/60',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    gradient: 'from-emerald-600 to-teal-600',
    confettiColors: ['#059669', '#34d399', '#10b981', '#f59e0b', '#60a5fa', '#ffffff']
  },
  {
    id: 'terracotta',
    name: 'Âmbar & Terracota',
    primary: '#d97706',
    primaryHover: '#b45309',
    accentBg: 'bg-amber-50 dark:bg-amber-950/40',
    cardBorder: 'border-amber-200 dark:border-amber-800/60',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/60',
    badgeText: 'text-amber-800 dark:text-amber-300',
    gradient: 'from-amber-600 to-rose-600',
    confettiColors: ['#d97706', '#f59e0b', '#f97316', '#ef4444', '#fbbf24', '#ffffff']
  },
  {
    id: 'ocean',
    name: 'Oceano Atlântico',
    primary: '#0284c7',
    primaryHover: '#0369a1',
    accentBg: 'bg-sky-50 dark:bg-sky-950/40',
    cardBorder: 'border-sky-200 dark:border-sky-800/60',
    badgeBg: 'bg-sky-100 dark:bg-sky-900/60',
    badgeText: 'text-sky-800 dark:text-sky-300',
    gradient: 'from-sky-600 to-cyan-600',
    confettiColors: ['#0284c7', '#38bdf8', '#06b6d4', '#6366f1', '#e0f2fe', '#ffffff']
  },
  {
    id: 'rose',
    name: 'Fúcsia & Framboesa',
    primary: '#e11d48',
    primaryHover: '#be123c',
    accentBg: 'bg-rose-50 dark:bg-rose-950/40',
    cardBorder: 'border-rose-200 dark:border-rose-800/60',
    badgeBg: 'bg-rose-100 dark:bg-rose-900/60',
    badgeText: 'text-rose-800 dark:text-rose-300',
    gradient: 'from-rose-600 to-pink-600',
    confettiColors: ['#e11d48', '#fb7185', '#f43f5e', '#a855f7', '#fbbf24', '#ffffff']
  },
  {
    id: 'graphite',
    name: 'Grafite & Ouro',
    primary: '#334155',
    primaryHover: '#1e293b',
    accentBg: 'bg-slate-100 dark:bg-slate-900/60',
    cardBorder: 'border-slate-300 dark:border-slate-700',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
    badgeText: 'text-amber-800 dark:text-amber-300',
    gradient: 'from-slate-800 to-slate-950',
    confettiColors: ['#eab308', '#facc15', '#94a3b8', '#cbd5e1', '#ffffff']
  }
];

export function getTheme(id: string): ThemeConfig {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}
