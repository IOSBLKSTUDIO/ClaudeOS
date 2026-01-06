import { create } from 'zustand';

export interface ContextMenuItem {
  type?: 'item' | 'separator';
  label?: string;
  icon?: string;
  shortcut?: string;
  action?: () => void;
  disabled?: boolean;
}

interface ContextMenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  items: ContextMenuItem[];
  openMenu: (x: number, y: number, items: ContextMenuItem[]) => void;
  closeMenu: () => void;
}

export const useContextMenuStore = create<ContextMenuState>((set) => ({
  isOpen: false,
  position: { x: 0, y: 0 },
  items: [],

  openMenu: (x, y, items) => {
    // Adjust position to keep menu on screen
    const menuWidth = 220;
    const menuHeight = items.length * 30;
    const adjustedX = Math.min(x, window.innerWidth - menuWidth);
    const adjustedY = Math.min(y, window.innerHeight - menuHeight);

    set({
      isOpen: true,
      position: { x: adjustedX, y: adjustedY },
      items,
    });
  },

  closeMenu: () => set({ isOpen: false }),
}));

// Default desktop context menu items
export const getDesktopContextMenuItems = (): ContextMenuItem[] => [
  { label: 'Nouveau dossier', icon: '📁', action: () => console.log('New folder') },
  { type: 'separator' },
  { label: 'Obtenir des informations', icon: 'ℹ️', shortcut: '⌘I' },
  { label: 'Modifier le fond d\'ecran...', icon: '🖼️', action: () => console.log('Change wallpaper') },
  { type: 'separator' },
  { label: 'Utiliser les piles', icon: '📚', disabled: true },
  { label: 'Trier par', icon: '↕️', disabled: true },
  { label: 'Ranger par', icon: '📋', disabled: true },
  { type: 'separator' },
  { label: 'Afficher les options de presentation', icon: '⚙️' },
];
