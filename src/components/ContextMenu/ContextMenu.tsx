import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContextMenuStore } from '../../stores/contextMenuStore';

export function ContextMenu() {
  const { isOpen, position, items, closeMenu } = useContextMenuStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, closeMenu]);

  // Close menu on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, closeMenu]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          className="fixed z-[10000] min-w-[200px] py-1 rounded-lg overflow-hidden"
          style={{
            left: position.x,
            top: position.y,
            background: 'rgba(40, 40, 44, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '0.5px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 0 0.5px rgba(0, 0, 0, 0.3)',
          }}
        >
          {items.map((item, index) => (
            item.type === 'separator' ? (
              <div
                key={index}
                className="my-1 h-[1px] mx-2"
                style={{ background: 'rgba(255, 255, 255, 0.1)' }}
              />
            ) : (
              <button
                key={index}
                className={`
                  w-full px-3 py-1.5 text-left text-[13px] flex items-center gap-3
                  transition-colors duration-75
                  ${item.disabled
                    ? 'text-white/30 cursor-default'
                    : 'text-white/90 hover:bg-[#0058d1]'
                  }
                `}
                onClick={() => {
                  if (!item.disabled && item.action) {
                    item.action();
                    closeMenu();
                  }
                }}
                disabled={item.disabled}
              >
                {item.icon && (
                  <span className="w-4 text-center opacity-70">{item.icon}</span>
                )}
                <span className="flex-1">{item.label}</span>
                {item.shortcut && (
                  <span className="text-white/40 text-[11px] ml-4">{item.shortcut}</span>
                )}
              </button>
            )
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
