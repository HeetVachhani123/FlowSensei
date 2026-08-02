// src/lib/labelConfig.ts
// Single source of truth for label colors used in both Card preview and CardModal editor.

export type LabelConfig = {
  bg: string;
  text: string;
  activeBg: string;
  activeText: string;
  border: string;
  activeBorder: string;
};

export const LABEL_CONFIG: Record<string, LabelConfig> = {
  'Bug':          { bg: 'bg-red-50 dark:bg-red-900/20',      text: 'text-red-600 dark:text-red-400',      activeBg: 'bg-red-500',    activeText: 'text-white', border: 'border-red-200 dark:border-red-800',     activeBorder: 'border-red-500'    },
  'Feature':      { bg: 'bg-blue-50 dark:bg-blue-900/20',    text: 'text-blue-600 dark:text-blue-400',    activeBg: 'bg-blue-500',   activeText: 'text-white', border: 'border-blue-200 dark:border-blue-800',   activeBorder: 'border-blue-500'   },
  'Enhancement':  { bg: 'bg-cyan-50 dark:bg-cyan-900/20',    text: 'text-cyan-600 dark:text-cyan-400',    activeBg: 'bg-cyan-500',   activeText: 'text-white', border: 'border-cyan-200 dark:border-cyan-800',   activeBorder: 'border-cyan-500'   },
  'High Priority':{ bg: 'bg-orange-50 dark:bg-orange-900/20',text: 'text-orange-600 dark:text-orange-400',activeBg: 'bg-orange-500', activeText: 'text-white', border: 'border-orange-200 dark:border-orange-800',activeBorder: 'border-orange-500' },
  'Design':       { bg: 'bg-purple-50 dark:bg-purple-900/20',text: 'text-purple-600 dark:text-purple-400',activeBg: 'bg-purple-500', activeText: 'text-white', border: 'border-purple-200 dark:border-purple-800',activeBorder: 'border-purple-500' },
  'Backend':      { bg: 'bg-zinc-100 dark:bg-zinc-800/60',   text: 'text-zinc-600 dark:text-zinc-400',    activeBg: 'bg-zinc-700',   activeText: 'text-white', border: 'border-zinc-300 dark:border-zinc-700',    activeBorder: 'border-zinc-600'   },
  'Frontend':     { bg: 'bg-green-50 dark:bg-green-900/20',  text: 'text-green-600 dark:text-green-400',  activeBg: 'bg-green-500',  activeText: 'text-white', border: 'border-green-200 dark:border-green-800',  activeBorder: 'border-green-500'  },
};

export const PREDEFINED_LABELS = Object.keys(LABEL_CONFIG);
