import { motion, AnimatePresence } from 'framer-motion';
import { useWindowStore } from '../../stores/windowStore';

interface AppleMenuProps {
  isOpen: boolean;
  onClick: () => void;
  onClose: () => void;
}

export function AppleMenu({ isOpen, onClick, onClose }: AppleMenuProps) {
  const openWindow = useWindowStore((s) => s.openWindow);
  const closeAllWindows = useWindowStore((s) => s.closeAllWindows);

  const menuItems = [
    { label: 'About This Mac', action: () => openWindow('settings') },
    { separator: true },
    { label: 'System Preferences...', action: () => openWindow('settings') },
    { separator: true },
    { label: 'Force Quit...', action: closeAllWindows },
    { separator: true },
    { label: 'Sleep', action: () => {} },
    { label: 'Restart...', action: () => window.location.reload() },
    { label: 'Shut Down...', action: () => {} },
  ];

  return (
    <div className="relative">
      <button
        className={`px-2 py-0.5 rounded hover:bg-white/10 transition-colors ${
          isOpen ? 'bg-white/10' : ''
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 fill-current"
        >
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-0 mt-1 min-w-[200px] py-1 rounded-lg shadow-xl"
            style={{
              backgroundColor: 'rgba(40, 40, 40, 0.95)',
              backdropFilter: 'blur(20px)',
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={(e) => e.stopPropagation()}
          >
            {menuItems.map((item, index) =>
              item.separator ? (
                <div
                  key={`sep-${index}`}
                  className="h-px mx-2 my-1 bg-white/20"
                />
              ) : (
                <button
                  key={item.label}
                  className="w-full px-3 py-1 text-left text-sm hover:bg-[#007aff] transition-colors"
                  onClick={() => {
                    item.action?.();
                    onClose();
                  }}
                >
                  {item.label}
                </button>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
