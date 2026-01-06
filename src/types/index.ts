// Window Types
export interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isFullscreen: boolean;
  zIndex: number;
  component: string;
  props?: Record<string, unknown>;
  resizable?: boolean;
}

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

// App Types
export type AppId =
  | 'finder'
  | 'terminal'
  | 'notes'
  | 'calculator'
  | 'settings'
  | 'safari'
  | 'music'
  | 'photos'
  | 'snake';

export interface AppConfig {
  id: AppId;
  name: string;
  icon: string;
  defaultWidth: number;
  defaultHeight: number;
  minWidth: number;
  minHeight: number;
  component: string;
  singleton?: boolean;
  resizable?: boolean;
}

// File System Types
export type FileType = 'file' | 'folder' | 'app' | 'image' | 'audio' | 'video' | 'document';

export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  path: string;
  parentId: string | null;
  size?: number;
  content?: string;
  mimeType?: string;
  icon?: string;
  createdAt: Date;
  modifiedAt: Date;
}

// Settings Types
export interface SettingsState {
  wallpaper: string;
  dockSize: number;
  dockMagnification: boolean;
  dockPosition: 'bottom' | 'left' | 'right';
  darkMode: boolean;
  accentColor: string;
  showDesktopIcons: boolean;
  username: string;
}

// Dock Types
export interface DockItem {
  id: string;
  appId: AppId;
  isPinned: boolean;
  isRunning: boolean;
  windowIds: string[];
}

// Menu Types
export interface MenuItem {
  id: string;
  label: string;
  shortcut?: string;
  action?: () => void;
  disabled?: boolean;
  separator?: boolean;
  submenu?: MenuItem[];
}

export interface MenuBarMenu {
  id: string;
  label: string;
  items: MenuItem[];
}

// Note Types
export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  createdAt: Date;
  modifiedAt: Date;
}

// Music Types
export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  url: string;
  artwork?: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: string[];
}

// Context Menu
export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  items: MenuItem[];
}

// Spotlight
export interface SpotlightResult {
  id: string;
  type: 'app' | 'file' | 'note' | 'setting';
  title: string;
  subtitle?: string;
  icon: string;
  action: () => void;
}
