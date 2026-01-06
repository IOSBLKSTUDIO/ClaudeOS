import type { AppConfig, AppId } from '../types';
import { translations, type Language } from '../i18n/translations';

// Base app configs without translated names
const baseAppConfigs: Record<AppId, Omit<AppConfig, 'name'>> = {
  finder: {
    id: 'finder',
    icon: 'finder',
    defaultWidth: 800,
    defaultHeight: 500,
    minWidth: 400,
    minHeight: 300,
    component: 'Finder',
    singleton: false,
  },
  terminal: {
    id: 'terminal',
    icon: 'terminal',
    defaultWidth: 600,
    defaultHeight: 400,
    minWidth: 400,
    minHeight: 200,
    component: 'Terminal',
    singleton: false,
  },
  notes: {
    id: 'notes',
    icon: 'notes',
    defaultWidth: 700,
    defaultHeight: 500,
    minWidth: 400,
    minHeight: 300,
    component: 'Notes',
    singleton: true,
  },
  calculator: {
    id: 'calculator',
    icon: 'calculator',
    defaultWidth: 270,
    defaultHeight: 480,
    minWidth: 270,
    minHeight: 480,
    component: 'Calculator',
    singleton: true,
    resizable: false,
  },
  settings: {
    id: 'settings',
    icon: 'settings',
    defaultWidth: 700,
    defaultHeight: 500,
    minWidth: 600,
    minHeight: 400,
    component: 'Settings',
    singleton: true,
  },
  safari: {
    id: 'safari',
    icon: 'safari',
    defaultWidth: 1000,
    defaultHeight: 700,
    minWidth: 500,
    minHeight: 400,
    component: 'Safari',
    singleton: false,
  },
  music: {
    id: 'music',
    icon: 'music',
    defaultWidth: 900,
    defaultHeight: 600,
    minWidth: 600,
    minHeight: 400,
    component: 'Music',
    singleton: true,
  },
  photos: {
    id: 'photos',
    icon: 'photos',
    defaultWidth: 900,
    defaultHeight: 600,
    minWidth: 600,
    minHeight: 400,
    component: 'Photos',
    singleton: true,
  },
  snake: {
    id: 'snake',
    icon: 'snake',
    defaultWidth: 540,
    defaultHeight: 640,
    minWidth: 540,
    minHeight: 640,
    component: 'Snake',
    singleton: true,
    resizable: false,
  },
};

// Get app configs with translated names
export const getAppConfigs = (language: Language): Record<AppId, AppConfig> => {
  const t = translations[language];
  const configs: Record<AppId, AppConfig> = {} as Record<AppId, AppConfig>;

  for (const [id, config] of Object.entries(baseAppConfigs)) {
    const appId = id as AppId;
    configs[appId] = {
      ...config,
      name: t.apps[appId],
    };
  }

  return configs;
};

// For backward compatibility - default to French
export const appConfigs = getAppConfigs('fr');

export const getAppConfig = (appId: AppId, language: Language = 'fr'): AppConfig | undefined => {
  const configs = getAppConfigs(language);
  return configs[appId];
};

export const getAllApps = (language: Language = 'fr'): AppConfig[] => {
  return Object.values(getAppConfigs(language));
};

export const getAppName = (appId: AppId, language: Language): string => {
  return translations[language].apps[appId];
};
