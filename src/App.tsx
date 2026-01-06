import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Desktop } from './components/Desktop';
import { MenuBar } from './components/MenuBar';
import { Dock } from './components/Dock';
import { WindowManager } from './components/Window';
import { Spotlight } from './components/Spotlight';
import { LoginScreen } from './components/LoginScreen';
import { ContextMenu } from './components/ContextMenu';
import { useContextMenuStore, getDesktopContextMenuItems } from './stores/contextMenuStore';
import './index.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { openMenu, closeMenu } = useContextMenuStore();

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // Handle right-click context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    openMenu(e.clientX, e.clientY, getDesktopContextMenuItems());
  }, [openMenu]);

  // Disable browser context menu globally
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', preventContextMenu);
    return () => document.removeEventListener('contextmenu', preventContextMenu);
  }, []);

  // Close context menu on scroll or resize
  useEffect(() => {
    const handleClose = () => closeMenu();
    window.addEventListener('scroll', handleClose);
    window.addEventListener('resize', handleClose);
    return () => {
      window.removeEventListener('scroll', handleClose);
      window.removeEventListener('resize', handleClose);
    };
  }, [closeMenu]);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-black macos-cursor"
      onContextMenu={handleContextMenu}
    >
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <LoginScreen key="login" onLogin={handleLogin} />
        ) : (
          <motion.div
            key="desktop"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full h-full"
          >
            {/* Desktop with wallpaper and icons */}
            <Desktop />

            {/* Window Manager - renders all open windows */}
            <WindowManager />

            {/* Menu Bar - top of screen */}
            <MenuBar />

            {/* Dock - bottom of screen */}
            <Dock />

            {/* Spotlight Search - triggered by Cmd+Space */}
            <Spotlight />

            {/* Context Menu */}
            <ContextMenu />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
