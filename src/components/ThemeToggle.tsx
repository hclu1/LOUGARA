'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border shadow-sm
        bg-slate-900/80 hover:bg-slate-800 text-amber-300 border-amber-500/30 hover:border-amber-400
        html.light:bg-white html.light:hover:bg-slate-100 html.light:text-slate-800 html.light:border-slate-300
        dark:bg-slate-900/80 dark:hover:bg-slate-800 dark:text-amber-300 dark:border-amber-500/30
        light:bg-white light:hover:bg-slate-100 light:text-slate-800 light:border-slate-300"
      title={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode foncé'}
      aria-label={theme === 'dark' ? 'Basculer en mode clair' : 'Basculer en mode foncé'}
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-4 h-4 text-amber-400 animate-spin-slow transition-transform hover:rotate-45" />
          <span className="text-xs font-bold hidden xl:inline text-amber-300">Mode Clair</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12" />
          <span className="text-xs font-bold hidden xl:inline text-slate-700">Mode Sombre</span>
        </>
      )}
    </button>
  );
};
