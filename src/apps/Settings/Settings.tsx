import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/settingsStore';
import { wallpaperOptions } from '../../components/Desktop/Wallpaper';
import { useTranslation } from '../../i18n/useTranslation';

export default function Settings() {
  const [activePanel, setActivePanel] = useState('general');
  const { t, language } = useTranslation();

  const {
    wallpaper,
    setWallpaper,
    dockSize,
    setDockSize,
    dockMagnification,
    setDockMagnification,
    darkMode,
    setDarkMode,
    showDesktopIcons,
    setShowDesktopIcons,
    username,
    setUsername,
    setLanguage,
  } = useSettingsStore();

  const settingsPanels = [
    { id: 'general', name: t.settings.general, icon: '⚙️' },
    { id: 'appearance', name: t.settings.appearance, icon: '🎨' },
    { id: 'dock', name: t.settings.desktop, icon: '🔲' },
    { id: 'language', name: t.settings.language, icon: '🌐' },
    { id: 'about', name: t.settings.about, icon: 'ℹ️' },
  ];

  const renderPanel = () => {
    switch (activePanel) {
      case 'general':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">{t.settings.general}</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <div className="text-white font-medium">
                    {language === 'fr' ? 'Nom d\'utilisateur' : 'Username'}
                  </div>
                  <div className="text-white/50 text-sm">
                    {language === 'fr' ? 'Votre nom d\'affichage' : 'Your display name'}
                  </div>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="px-3 py-1.5 bg-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-[#007aff]"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <div className="text-white font-medium">
                    {language === 'fr' ? 'Afficher les icônes du bureau' : 'Show Desktop Icons'}
                  </div>
                  <div className="text-white/50 text-sm">
                    {language === 'fr' ? 'Afficher les icônes sur le bureau' : 'Display icons on desktop'}
                  </div>
                </div>
                <Toggle value={showDesktopIcons} onChange={setShowDesktopIcons} />
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">{t.settings.appearance}</h2>

            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="text-white font-medium mb-3">{t.settings.wallpaper}</div>
                <div className="grid grid-cols-4 gap-3">
                  {wallpaperOptions.map((wp) => (
                    <motion.button
                      key={wp}
                      className={`h-16 rounded-lg capitalize text-xs text-white ${
                        wallpaper === wp
                          ? 'ring-2 ring-[#007aff] ring-offset-2 ring-offset-[#2d2d2d]'
                          : ''
                      }`}
                      style={{
                        background: getWallpaperPreview(wp),
                      }}
                      onClick={() => setWallpaper(wp)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {wp}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <div className="text-white font-medium">
                    {language === 'fr' ? 'Mode sombre' : 'Dark Mode'}
                  </div>
                  <div className="text-white/50 text-sm">
                    {language === 'fr' ? 'Utiliser l\'apparence sombre' : 'Use dark appearance'}
                  </div>
                </div>
                <Toggle value={darkMode} onChange={setDarkMode} />
              </div>
            </div>
          </div>
        );

      case 'dock':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">{t.settings.desktop}</h2>

            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-medium">{t.settings.dockSize}</div>
                  <div className="text-white/50 text-sm">{dockSize}px</div>
                </div>
                <input
                  type="range"
                  min="32"
                  max="80"
                  value={dockSize}
                  onChange={(e) => setDockSize(Number(e.target.value))}
                  className="w-full accent-[#007aff]"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <div className="text-white font-medium">{t.settings.dockMagnification}</div>
                  <div className="text-white/50 text-sm">
                    {language === 'fr' ? 'Agrandir les icônes au survol' : 'Enlarge icons on hover'}
                  </div>
                </div>
                <Toggle value={dockMagnification} onChange={setDockMagnification} />
              </div>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">{t.settings.language}</h2>

            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="text-white font-medium mb-4">{t.settings.systemLanguage}</div>
                <div className="space-y-2">
                  <LanguageOption
                    label="Français"
                    flag="🇫🇷"
                    isSelected={language === 'fr'}
                    onClick={() => setLanguage('fr')}
                  />
                  <LanguageOption
                    label="English"
                    flag="🇬🇧"
                    isSelected={language === 'en'}
                    onClick={() => setLanguage('en')}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🖥️</div>
              <h2 className="text-2xl font-bold text-white">ClaudeOS</h2>
              <p className="text-white/50 mt-1">{t.settings.version} 1.0.0</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white/60">Framework</span>
                <span className="text-white">React 18</span>
              </div>
              <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white/60">{language === 'fr' ? 'Langage' : 'Language'}</span>
                <span className="text-white">TypeScript 5</span>
              </div>
              <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white/60">Build Tool</span>
                <span className="text-white">Vite</span>
              </div>
              <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white/60">Styling</span>
                <span className="text-white">TailwindCSS</span>
              </div>
              <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white/60">Animations</span>
                <span className="text-white">Framer Motion</span>
              </div>
              <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white/60">{language === 'fr' ? 'État' : 'State'}</span>
                <span className="text-white">Zustand</span>
              </div>
            </div>

            <div className="text-center text-white/40 text-xs pt-4">
              {language === 'fr' ? 'Créé avec ❤️ par Claude' : 'Built with ❤️ using Claude'}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-full bg-[#2d2d2d]">
      {/* Sidebar */}
      <div className="w-56 bg-[#1e1e1e]/50 border-r border-white/10 py-2">
        {settingsPanels.map((panel) => (
          <button
            key={panel.id}
            className={`w-full px-4 py-2 flex items-center gap-3 text-left transition-colors ${
              activePanel === panel.id
                ? 'bg-[#007aff] text-white'
                : 'text-white/80 hover:bg-white/10'
            }`}
            onClick={() => setActivePanel(panel.id)}
          >
            <span>{panel.icon}</span>
            <span>{panel.name}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">{renderPanel()}</div>
    </div>
  );
}

// Toggle component
function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      className={`w-12 h-7 rounded-full transition-colors ${
        value ? 'bg-[#28c840]' : 'bg-white/20'
      }`}
      onClick={() => onChange(!value)}
    >
      <motion.div
        className="w-5 h-5 bg-white rounded-full shadow-md"
        animate={{ x: value ? 24 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

// Language option component
function LanguageOption({
  label,
  flag,
  isSelected,
  onClick,
}: {
  label: string;
  flag: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
        isSelected
          ? 'bg-[#007aff] text-white'
          : 'bg-white/5 text-white/80 hover:bg-white/10'
      }`}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
    >
      <span className="text-2xl">{flag}</span>
      <span className="font-medium">{label}</span>
      {isSelected && (
        <motion.span
          className="ml-auto"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          ✓
        </motion.span>
      )}
    </motion.button>
  );
}

function getWallpaperPreview(name: string): string {
  const wallpapers: Record<string, string> = {
    sequoia: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #e94560 100%)',
    ventura: 'linear-gradient(180deg, #2c3e50 0%, #3498db 50%, #9b59b6 100%)',
    monterey: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    bigsur: 'linear-gradient(180deg, #ff6b6b 0%, #feca57 25%, #48dbfb 50%, #ff9ff3 75%, #54a0ff 100%)',
    catalina: 'linear-gradient(180deg, #0c3483 0%, #a2b6df 50%, #6b4984 100%)',
    mojave: 'linear-gradient(180deg, #232526 0%, #414345 100%)',
    sonoma: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)',
    midnight: 'linear-gradient(180deg, #020617 0%, #0f172a 50%, #1e293b 100%)',
  };
  return wallpapers[name] || wallpapers.sequoia;
}
