import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDockStore } from '../../stores/dockStore';
import { useWindowStore } from '../../stores/windowStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { DockItem } from './DockItem';
import { DockSeparator } from './DockSeparator';

export function Dock() {
  const items = useDockStore((s) => s.items);
  const openWindow = useWindowStore((s) => s.openWindow);
  const restoreWindow = useWindowStore((s) => s.restoreWindow);
  const windows = useWindowStore((s) => s.windows);
  const dockSize = useSettingsStore((s) => s.dockSize);
  const setDockSize = useSettingsStore((s) => s.setDockSize);

  const dockRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartY, setResizeStartY] = useState(0);
  const [resizeStartSize, setResizeStartSize] = useState(dockSize);

  const handleItemClick = (appId: string) => {
    const appWindows = windows.filter((w) => w.appId === appId);
    const minimizedWindow = appWindows.find((w) => w.isMinimized);

    if (minimizedWindow) {
      restoreWindow(minimizedWindow.id);
    } else {
      openWindow(appId as any);
    }
  };

  // Resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStartY(e.clientY);
    setResizeStartSize(dockSize);
  }, [dockSize]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    // Moving up = larger dock, moving down = smaller dock
    const deltaY = resizeStartY - e.clientY;
    const newSize = Math.min(80, Math.max(32, resizeStartSize + deltaY * 0.5));
    setDockSize(Math.round(newSize));
  }, [isResizing, resizeStartY, resizeStartSize, setDockSize]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Global mouse events for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Separate pinned and running items
  const pinnedItems = items.filter((item) => item.isPinned);
  const runningOnlyItems = items.filter(
    (item) => item.isRunning && !item.isPinned
  );

  return (
    <motion.div
      className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      {/* Resize handle */}
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 cursor-ns-resize group flex items-center justify-center z-10"
        onMouseDown={handleResizeStart}
      >
        {/* Visual indicator - only visible on hover or during resize */}
        <motion.div
          className="w-10 h-1 rounded-full transition-colors"
          style={{
            background: isResizing
              ? 'rgba(255, 255, 255, 0.6)'
              : 'rgba(255, 255, 255, 0.2)',
          }}
          whileHover={{
            background: 'rgba(255, 255, 255, 0.5)',
            scaleX: 1.2,
          }}
        />
      </div>

      {/* Size indicator during resize */}
      {isResizing && (
        <motion.div
          className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-white text-xs font-medium"
          style={{
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {dockSize}px
        </motion.div>
      )}

      <motion.div
        ref={dockRef}
        className="flex items-end gap-1.5 px-2.5 pb-1.5 pt-1.5"
        style={{
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.12) 100%)',
          backdropFilter: 'blur(50px) saturate(180%)',
          WebkitBackdropFilter: 'blur(50px) saturate(180%)',
          borderRadius: 20,
          border: '0.5px solid rgba(255, 255, 255, 0.25)',
          boxShadow: `
            0 0 0 0.5px rgba(0, 0, 0, 0.3),
            0 20px 60px rgba(0, 0, 0, 0.35),
            0 8px 20px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.25),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1)
          `,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        {pinnedItems.map((item) => (
          <DockItem
            key={item.id}
            item={item}
            baseSize={dockSize}
            onClick={() => handleItemClick(item.appId)}
          />
        ))}

        {runningOnlyItems.length > 0 && <DockSeparator />}

        {runningOnlyItems.map((item) => (
          <DockItem
            key={item.id}
            item={item}
            baseSize={dockSize}
            onClick={() => handleItemClick(item.appId)}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
