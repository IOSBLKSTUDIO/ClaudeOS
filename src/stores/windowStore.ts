import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { WindowState, AppId } from '../types';
import { appConfigs } from '../config/apps';

interface WindowStore {
  windows: WindowState[];
  activeWindowId: string | null;
  highestZIndex: number;

  // Actions
  openWindow: (appId: AppId, props?: Record<string, unknown>) => string;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  updateWindowPosition: (windowId: string, x: number, y: number) => void;
  updateWindowSize: (windowId: string, width: number, height: number) => void;
  toggleFullscreen: (windowId: string) => void;
  getWindowsByApp: (appId: AppId) => WindowState[];
  closeAllWindows: () => void;
}

const getInitialPosition = (index: number) => ({
  x: 100 + (index * 30),
  y: 60 + (index * 30),
});

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  activeWindowId: null,
  highestZIndex: 1,

  openWindow: (appId, props) => {
    const config = appConfigs[appId];
    if (!config) return '';

    // Check singleton
    if (config.singleton) {
      const existing = get().windows.find(w => w.appId === appId && !w.isMinimized);
      if (existing) {
        get().focusWindow(existing.id);
        return existing.id;
      }
    }

    const windowCount = get().windows.length;
    const position = getInitialPosition(windowCount);
    const newZIndex = get().highestZIndex + 1;

    const newWindow: WindowState = {
      id: uuidv4(),
      appId,
      title: config.name,
      x: position.x,
      y: position.y,
      width: config.defaultWidth,
      height: config.defaultHeight,
      minWidth: config.minWidth,
      minHeight: config.minHeight,
      isMinimized: false,
      isMaximized: false,
      isFullscreen: false,
      zIndex: newZIndex,
      component: config.component,
      props,
      resizable: config.resizable !== false, // Par défaut true, sauf si explicitement false
    };

    set(state => ({
      windows: [...state.windows, newWindow],
      activeWindowId: newWindow.id,
      highestZIndex: newZIndex,
    }));

    return newWindow.id;
  },

  closeWindow: (windowId) => {
    set(state => {
      const newWindows = state.windows.filter(w => w.id !== windowId);
      const newActiveId = state.activeWindowId === windowId
        ? newWindows[newWindows.length - 1]?.id ?? null
        : state.activeWindowId;

      return {
        windows: newWindows,
        activeWindowId: newActiveId,
      };
    });
  },

  minimizeWindow: (windowId) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === windowId ? { ...w, isMinimized: true } : w
      ),
      activeWindowId: state.activeWindowId === windowId ? null : state.activeWindowId,
    }));
  },

  maximizeWindow: (windowId) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === windowId ? { ...w, isMaximized: true, isMinimized: false } : w
      ),
    }));
  },

  restoreWindow: (windowId) => {
    const newZIndex = get().highestZIndex + 1;
    set(state => ({
      windows: state.windows.map(w =>
        w.id === windowId
          ? { ...w, isMinimized: false, isMaximized: false, zIndex: newZIndex }
          : w
      ),
      activeWindowId: windowId,
      highestZIndex: newZIndex,
    }));
  },

  focusWindow: (windowId) => {
    const newZIndex = get().highestZIndex + 1;
    set(state => ({
      windows: state.windows.map(w =>
        w.id === windowId ? { ...w, zIndex: newZIndex, isMinimized: false } : w
      ),
      activeWindowId: windowId,
      highestZIndex: newZIndex,
    }));
  },

  updateWindowPosition: (windowId, x, y) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === windowId ? { ...w, x, y, isMaximized: false } : w
      ),
    }));
  },

  updateWindowSize: (windowId, width, height) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === windowId ? { ...w, width, height, isMaximized: false } : w
      ),
    }));
  },

  toggleFullscreen: (windowId) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === windowId ? { ...w, isFullscreen: !w.isFullscreen } : w
      ),
    }));
  },

  getWindowsByApp: (appId) => {
    return get().windows.filter(w => w.appId === appId);
  },

  closeAllWindows: () => {
    set({ windows: [], activeWindowId: null });
  },
}));
