import { useState, useEffect } from 'react';
import { AppleMenu } from './AppleMenu';
import { AppMenu } from './AppMenu';
import { SystemTray } from './SystemTray';
import { useWindowStore } from '../../stores/windowStore';
import { appConfigs } from '../../config/apps';

export function MenuBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const activeWindowId = useWindowStore((s) => s.activeWindowId);
  const windows = useWindowStore((s) => s.windows);

  const activeWindow = windows.find((w) => w.id === activeWindowId);
  const activeApp = activeWindow
    ? appConfigs[activeWindow.appId as keyof typeof appConfigs]
    : null;

  const handleMenuClick = (menuId: string) => {
    setOpenMenu(openMenu === menuId ? null : menuId);
  };

  const handleClose = () => {
    setOpenMenu(null);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenu) {
        setOpenMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenu]);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-7 z-[9999] flex items-center px-4 text-white text-[13px]"
      style={{
        background: 'linear-gradient(180deg, rgba(45, 45, 48, 0.88) 0%, rgba(35, 35, 38, 0.92) 100%)',
        backdropFilter: 'blur(80px) saturate(200%)',
        WebkitBackdropFilter: 'blur(80px) saturate(200%)',
        borderBottom: '0.5px solid rgba(0, 0, 0, 0.3)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Apple Menu */}
      <AppleMenu
        isOpen={openMenu === 'apple'}
        onClick={() => handleMenuClick('apple')}
        onClose={handleClose}
      />

      {/* App Menu */}
      <div className="flex items-center gap-4 ml-4">
        <span className="font-semibold">
          {activeApp?.name || 'Finder'}
        </span>

        <AppMenu
          appName={activeApp?.name || 'Finder'}
          isOpen={openMenu === 'app'}
          onClick={() => handleMenuClick('app')}
          onClose={handleClose}
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* System Tray */}
      <SystemTray />
    </div>
  );
}
