// src/ThemeService.tsx

type Theme = 'light' | 'dark';
type ThemeListener = (theme: Theme) => void;

class ThemeService {
  private theme: Theme = 'light';
  private listeners: Set<ThemeListener> = new Set();

  constructor() {
    const savedTheme = window.localStorage.getItem('theme') as Theme | null;
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.theme = savedTheme || (userPrefersDark ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme() {
    document.body.setAttribute('data-theme', this.theme);
    window.localStorage.setItem('theme', this.theme);
    this.listeners.forEach(listener => listener(this.theme));
  }

  toggleTheme = () => {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme();
  };

  getTheme = (): Theme => {
    return this.theme;
  };

  subscribe = (listener: ThemeListener): (() => void) => {
    this.listeners.add(listener);
    listener(this.theme);
    return () => {
      this.listeners.delete(listener);
    };
  };
}

export const themeService = new ThemeService();