import { motion, AnimatePresence } from 'framer-motion';

interface AppMenuProps {
  appName: string;
  isOpen: boolean;
  onClick: () => void;
  onClose: () => void;
}

const menuStructure: Record<string, { label: string; items: { label: string; shortcut?: string }[] }[]> = {
  default: [
    {
      label: 'File',
      items: [
        { label: 'New Window', shortcut: '⌘N' },
        { label: 'Close Window', shortcut: '⌘W' },
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: '⌘Z' },
        { label: 'Redo', shortcut: '⇧⌘Z' },
        { label: 'Cut', shortcut: '⌘X' },
        { label: 'Copy', shortcut: '⌘C' },
        { label: 'Paste', shortcut: '⌘V' },
        { label: 'Select All', shortcut: '⌘A' },
      ],
    },
    {
      label: 'View',
      items: [
        { label: 'Zoom In', shortcut: '⌘+' },
        { label: 'Zoom Out', shortcut: '⌘-' },
        { label: 'Enter Full Screen', shortcut: '⌃⌘F' },
      ],
    },
    {
      label: 'Window',
      items: [
        { label: 'Minimize', shortcut: '⌘M' },
        { label: 'Zoom' },
        { label: 'Bring All to Front' },
      ],
    },
    {
      label: 'Help',
      items: [
        { label: 'ClaudeOS Help' },
      ],
    },
  ],
};

export function AppMenu({ isOpen, onClick, onClose }: AppMenuProps) {
  const menus = menuStructure.default;

  return (
    <div className="flex items-center gap-4">
      {menus.map((menu) => (
        <div key={menu.label} className="relative">
          <button
            className="px-2 py-0.5 rounded hover:bg-white/10 transition-colors text-sm text-white/80 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            {menu.label}
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="absolute top-full left-0 mt-1 min-w-[180px] py-1 rounded-lg shadow-xl"
                style={{
                  backgroundColor: 'rgba(40, 40, 40, 0.95)',
                  backdropFilter: 'blur(20px)',
                }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={(e) => e.stopPropagation()}
              >
                {menu.items.map((item, index) => (
                  <button
                    key={`${menu.label}-${index}`}
                    className="w-full px-3 py-1 text-left text-sm hover:bg-[#007aff] transition-colors flex items-center justify-between"
                    onClick={onClose}
                  >
                    <span>{item.label}</span>
                    {item.shortcut && (
                      <span className="text-white/50 text-xs ml-4">
                        {item.shortcut}
                      </span>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
