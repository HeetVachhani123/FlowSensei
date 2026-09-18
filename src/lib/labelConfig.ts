// src/lib/labelConfig.ts
// Single source of truth for label colors used in both Card preview and CardModal editor.
// Optimized for rich, high-contrast readability in both Light and Dark mode.

export type LabelConfig = {
  bg: string;
  text: string;
  activeBg: string;
  activeText: string;
  border: string;
  activeBorder: string;
};

export const LABEL_CONFIG: Record<string, LabelConfig> = {
  'Bug': {
    bg: 'bg-red-50 dark:bg-red-950/40',
    text: 'text-red-700 dark:text-red-300',
    activeBg: 'bg-red-600 dark:bg-red-500',
    activeText: 'text-white',
    border: 'border-red-200 dark:border-red-800/80',
    activeBorder: 'border-red-600 dark:border-red-500',
  },
  'Feature': {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    activeBg: 'bg-blue-600 dark:bg-blue-500',
    activeText: 'text-white',
    border: 'border-blue-200 dark:border-blue-800/80',
    activeBorder: 'border-blue-600 dark:border-blue-500',
  },
  'Enhancement': {
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    text: 'text-cyan-800 dark:text-cyan-300',
    activeBg: 'bg-cyan-600 dark:bg-cyan-500',
    activeText: 'text-white',
    border: 'border-cyan-200 dark:border-cyan-800/80',
    activeBorder: 'border-cyan-600 dark:border-cyan-500',
  },
  'High Priority': {
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    text: 'text-orange-800 dark:text-orange-300',
    activeBg: 'bg-orange-600 dark:bg-orange-500',
    activeText: 'text-white',
    border: 'border-orange-200 dark:border-orange-800/80',
    activeBorder: 'border-orange-600 dark:border-orange-500',
  },
  'Design': {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-800 dark:text-purple-300',
    activeBg: 'bg-purple-600 dark:bg-purple-500',
    activeText: 'text-white',
    border: 'border-purple-200 dark:border-purple-800/80',
    activeBorder: 'border-purple-600 dark:border-purple-500',
  },
  'Backend': {
    bg: 'bg-zinc-100 dark:bg-zinc-800/60',
    text: 'text-zinc-800 dark:text-zinc-300',
    activeBg: 'bg-zinc-800 dark:bg-zinc-700',
    activeText: 'text-white',
    border: 'border-zinc-300 dark:border-zinc-700',
    activeBorder: 'border-zinc-800 dark:border-zinc-600',
  },
  'Frontend': {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-800 dark:text-emerald-300',
    activeBg: 'bg-emerald-600 dark:bg-emerald-500',
    activeText: 'text-white',
    border: 'border-emerald-200 dark:border-emerald-800/80',
    activeBorder: 'border-emerald-600 dark:border-emerald-500',
  },
  'Documentation': {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-800 dark:text-amber-300',
    activeBg: 'bg-amber-600 dark:bg-amber-500',
    activeText: 'text-white',
    border: 'border-amber-200 dark:border-amber-800/80',
    activeBorder: 'border-amber-600 dark:border-amber-500',
  },
  'Security': {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-800 dark:text-rose-300',
    activeBg: 'bg-rose-600 dark:bg-rose-500',
    activeText: 'text-white',
    border: 'border-rose-200 dark:border-rose-800/80',
    activeBorder: 'border-rose-600 dark:border-rose-500',
  },
  'Performance': {
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-800 dark:text-indigo-300',
    activeBg: 'bg-indigo-600 dark:bg-indigo-500',
    activeText: 'text-white',
    border: 'border-indigo-200 dark:border-indigo-800/80',
    activeBorder: 'border-indigo-600 dark:border-indigo-500',
  },
  'Testing': {
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    text: 'text-teal-800 dark:text-teal-300',
    activeBg: 'bg-teal-600 dark:bg-teal-500',
    activeText: 'text-white',
    border: 'border-teal-200 dark:border-teal-800/80',
    activeBorder: 'border-teal-600 dark:border-teal-500',
  },
};

export const PREDEFINED_LABELS = Object.keys(LABEL_CONFIG);

/**
 * Robust case-insensitive label configuration lookup.
 * Ensures labels matching case or lowercase (e.g. 'bug' -> 'Bug') resolve to their intended color tokens.
 */
export function getLabelConfig(label: string): LabelConfig | undefined {
  if (!label) return undefined;
  if (LABEL_CONFIG[label]) return LABEL_CONFIG[label];
  const lower = label.toLowerCase();
  const key = Object.keys(LABEL_CONFIG).find(k => k.toLowerCase() === lower);
  return key ? LABEL_CONFIG[key] : undefined;
}
