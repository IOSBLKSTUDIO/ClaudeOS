import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SettingsState } from '../types';
import type { Language } from '../i18n/translations';

interface SettingsStore extends SettingsState {
  language: Language;
  setWallpaper: (wallpaper: string) => void;
  setDockSize: (size: number) => void;
  setDockMagnification: (enabled: boolean) => void;
  setDockPosition: (position: 'bottom' | 'left' | 'right') => void;
  setDarkMode: (enabled: boolean) => void;
  setAccentColor: (color: string) => void;
  setShowDesktopIcons: (show: boolean) => void;
  setUsername: (name: string) => void;
  setLanguage: (language: Language) => void;
  resetSettings: () => void;
}

const defaultSettings: SettingsState & { language: Language } = {
  wallpaper: 'sequoia',
  dockSize: 48,
  dockMagnification: true,
  dockPosition: 'bottom',
  darkMode: true,
  accentColor: '#007aff',
  showDesktopIcons: true,
  username: 'User',
  language: 'fr',
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setWallpaper: (wallpaper) => set({ wallpaper }),
      setDockSize: (dockSize) => set({ dockSize }),
      setDockMagnification: (dockMagnification) => set({ dockMagnification }),
      setDockPosition: (dockPosition) => set({ dockPosition }),
      setDarkMode: (darkMode) => set({ darkMode }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setShowDesktopIcons: (showDesktopIcons) => set({ showDesktopIcons }),
      setUsername: (username) => set({ username }),
      setLanguage: (language) => set({ language }),
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'claudeos-settings',
    }
  )
);
