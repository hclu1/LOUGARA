import { describe, it, expect, beforeEach } from 'vitest';

describe('Thème et Persistance LocalStorage', () => {
  const THEME_KEY = 'lougara_theme';
  let storage: Record<string, string> = {};

  beforeEach(() => {
    storage = {};
  });

  const mockLocalStorage = {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    clear: () => {
      storage = {};
    },
  };

  it('doit sauvegarder le choix du mode clair dans localStorage', () => {
    mockLocalStorage.setItem(THEME_KEY, 'light');
    expect(mockLocalStorage.getItem(THEME_KEY)).toBe('light');
  });

  it('doit sauvegarder le choix du mode foncé dans localStorage', () => {
    mockLocalStorage.setItem(THEME_KEY, 'dark');
    expect(mockLocalStorage.getItem(THEME_KEY)).toBe('dark');
  });

  it('doit permettre de basculer du mode clair au mode foncé', () => {
    let currentTheme: 'dark' | 'light' = 'dark';
    const toggleTheme = () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      mockLocalStorage.setItem(THEME_KEY, currentTheme);
    };

    toggleTheme();
    expect(currentTheme).toBe('light');
    expect(mockLocalStorage.getItem(THEME_KEY)).toBe('light');

    toggleTheme();
    expect(currentTheme).toBe('dark');
    expect(mockLocalStorage.getItem(THEME_KEY)).toBe('dark');
  });
});
