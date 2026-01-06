import { useRef, useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WindowState } from '../../types';
import { useWindowStore } from '../../stores/windowStore';
import { WindowControls } from './WindowControls';

interface WindowProps {
  window: WindowState;
  children: React.ReactNode;
}

export function Window({ window: win, children }: WindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const {
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    activeWindowId,
  } = useWindowStore();

  const isActive = activeWindowId === win.id;

  // Handle window focus
  const handleFocus = useCallback(() => {
    if (!isActive) {
      focusWindow(win.id);
    }
  }, [isActive, focusWindow, win.id]);

  // Drag handlers
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (win.isFullscreen || win.isMaximized) return;
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - win.x,
      y: e.clientY - win.y,
    });
    focusWindow(win.id);
  }, [win.isFullscreen, win.isMaximized, win.x, win.y, win.id, focusWindow]);

  const handleDrag = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const newX = Math.max(0, e.clientX - dragOffset.x);
    const newY = Math.max(28, e.clientY - dragOffset.y); // Keep below menubar
    updateWindowPosition(win.id, newX, newY);
  }, [isDragging, dragOffset, win.id, updateWindowPosition]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent, _direction: string) => {
    if (win.isFullscreen || win.isMaximized || win.resizable === false) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      w: win.width,
      h: win.height,
    });
    focusWindow(win.id);
  }, [win.isFullscreen, win.isMaximized, win.width, win.height, win.id, focusWindow]);

  const handleResize = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const dx = e.clientX - resizeStart.x;
    const dy = e.clientY - resizeStart.y;
    const newWidth = Math.max(win.minWidth, resizeStart.w + dx);
    const newHeight = Math.max(win.minHeight, resizeStart.h + dy);
    updateWindowSize(win.id, newWidth, newHeight);
  }, [isResizing, resizeStart, win.id, win.minWidth, win.minHeight, updateWindowSize]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Double click header to maximize/restore (disabled for non-resizable windows)
  const handleDoubleClick = useCallback(() => {
    if (win.resizable === false) return; // Don't allow maximize for non-resizable windows
    if (win.isMaximized) {
      restoreWindow(win.id);
    } else {
      maximizeWindow(win.id);
    }
  }, [win.isMaximized, win.id, win.resizable, restoreWindow, maximizeWindow]);

  // Mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDrag, handleDragEnd]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResize, handleResizeEnd]);

  // Calculate position and size
  const windowStyle = win.isFullscreen
    ? { top: 0, left: 0, width: '100vw', height: '100vh' }
    : win.isMaximized
    ? { top: 28, left: 0, width: '100vw', height: 'calc(100vh - 28px - 80px)' }
    : {
        top: win.y,
        left: win.x,
        width: win.width,
        height: win.height,
      };

  return (
    <AnimatePresence>
      {!win.isMinimized && (
        <motion.div
          ref={windowRef}
          className={`absolute flex flex-col overflow-hidden ${
            isActive ? 'window-shadow' : 'window-shadow-inactive'
          }`}
          style={{
            ...windowStyle,
            zIndex: win.zIndex,
            borderRadius: win.isFullscreen ? 0 : 12,
            border: '0.5px solid rgba(255, 255, 255, 0.1)',
          }}
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          onMouseDown={handleFocus}
        >
          {/* Window Header - Frosted glass effect */}
          <div
            className="flex items-center h-[52px] pl-5 pr-5 select-none relative"
            style={{
              background: isActive
                ? 'linear-gradient(180deg, rgba(68, 68, 72, 0.98) 0%, rgba(48, 48, 52, 0.98) 100%)'
                : 'linear-gradient(180deg, rgba(58, 58, 62, 0.95) 0%, rgba(42, 42, 46, 0.95) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
              borderBottom: '0.5px solid rgba(0, 0, 0, 0.3)',
            }}
            onMouseDown={handleDragStart}
            onDoubleClick={handleDoubleClick}
          >
            {/* Subtle top highlight */}
            <div
              className="absolute top-0 left-0 right-0 h-[1px]"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
              }}
            />

            <WindowControls
              onClose={() => closeWindow(win.id)}
              onMinimize={() => minimizeWindow(win.id)}
              onMaximize={() => win.isMaximized ? restoreWindow(win.id) : maximizeWindow(win.id)}
              isActive={isActive}
              disableMaximize={win.resizable === false}
            />

            <div className="flex-1 text-center">
              <span
                className="text-[13px] font-medium tracking-[-0.01em]"
                style={{
                  color: isActive ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.45)',
                  textShadow: isActive ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                }}
              >
                {win.title}
              </span>
            </div>

            <div className="w-20" /> {/* Spacer for balance */}
          </div>

          {/* Window Content - Deep dark with subtle gradient */}
          <div
            className="flex-1 overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #232326 0%, #1c1c1e 100%)',
            }}
          >
            {children}
          </div>

          {/* Resize Handle with visual indicator - only show if window is resizable */}
          {!win.isFullscreen && !win.isMaximized && win.resizable !== false && (
            <div
              className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity"
              onMouseDown={(e) => handleResizeStart(e, 'se')}
              style={{
                background: 'linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.1) 50%)',
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
