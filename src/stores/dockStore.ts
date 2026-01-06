import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DockItem, AppId } from '../types';

interface DockStore {
  items: DockItem[];

  addToDock: (appId: AppId, isPinned?: boolean) => void;
  removeFromDock: (appId: AppId) => void;
  setPinned: (appId: AppId, isPinned: boolean) => void;
  setRunning: (appId: AppId, isRunning: boolean, windowIds?: string[]) => void;
  reorderDock: (fromIndex: number, toIndex: number) => void;
  addWindowToApp: (appId: AppId, windowId: string) => void;
  removeWindowFromApp: (appId: AppId, windowId: string) => void;
}

const defaultDockItems: DockItem[] = [
  { id: 'dock-finder', appId: 'finder', isPinned: true, isRunning: false, windowIds: [] },
  { id: 'dock-safari', appId: 'safari', isPinned: true, isRunning: false, windowIds: [] },
  { id: 'dock-notes', appId: 'notes', isPinned: true, isRunning: false, windowIds: [] },
  { id: 'dock-terminal', appId: 'terminal', isPinned: true, isRunning: false, windowIds: [] },
  { id: 'dock-calculator', appId: 'calculator', isPinned: true, isRunning: false, windowIds: [] },
  { id: 'dock-music', appId: 'music', isPinned: true, isRunning: false, windowIds: [] },
  { id: 'dock-photos', appId: 'photos', isPinned: true, isRunning: false, windowIds: [] },
  { id: 'dock-snake', appId: 'snake', isPinned: true, isRunning: false, windowIds: [] },
  { id: 'dock-settings', appId: 'settings', isPinned: true, isRunning: false, windowIds: [] },
];

export const useDockStore = create<DockStore>()(
  persist(
    (set, get) => ({
      items: defaultDockItems,

      addToDock: (appId, isPinned = false) => {
        const exists = get().items.find(item => item.appId === appId);
        if (exists) return;

        set(state => ({
          items: [...state.items, {
            id: `dock-${appId}`,
            appId,
            isPinned,
            isRunning: false,
            windowIds: [],
          }],
        }));
      },

      removeFromDock: (appId) => {
        set(state => ({
          items: state.items.filter(item =>
            item.appId !== appId || item.isRunning
          ),
        }));
      },

      setPinned: (appId, isPinned) => {
        set(state => ({
          items: state.items.map(item =>
            item.appId === appId ? { ...item, isPinned } : item
          ),
        }));
      },

      setRunning: (appId, isRunning, windowIds = []) => {
        set(state => {
          const exists = state.items.find(item => item.appId === appId);

          if (!exists && isRunning) {
            return {
              items: [...state.items, {
                id: `dock-${appId}`,
                appId,
                isPinned: false,
                isRunning: true,
                windowIds,
              }],
            };
          }

          return {
            items: state.items
              .map(item => item.appId === appId
                ? { ...item, isRunning, windowIds }
                : item
              )
              .filter(item => item.isPinned || item.isRunning),
          };
        });
      },

      reorderDock: (fromIndex, toIndex) => {
        set(state => {
          const items = [...state.items];
          const [removed] = items.splice(fromIndex, 1);
          items.splice(toIndex, 0, removed);
          return { items };
        });
      },

      addWindowToApp: (appId, windowId) => {
        set(state => ({
          items: state.items.map(item =>
            item.appId === appId
              ? {
                  ...item,
                  isRunning: true,
                  windowIds: [...item.windowIds, windowId]
                }
              : item
          ),
        }));
      },

      removeWindowFromApp: (appId, windowId) => {
        set(state => ({
          items: state.items.map(item => {
            if (item.appId !== appId) return item;
            const windowIds = item.windowIds.filter(id => id !== windowId);
            return {
              ...item,
              windowIds,
              isRunning: windowIds.length > 0,
            };
          }).filter(item => item.isPinned || item.isRunning),
        }));
      },
    }),
    {
      name: 'claudeos-dock-v2',
    }
  )
);
