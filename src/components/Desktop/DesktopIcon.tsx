import { useState } from 'react';
import { motion } from 'framer-motion';
import type { AppId } from '../../types';
import { AppIcon } from '../shared/AppIcon';

interface DesktopIconProps {
  appId: AppId;
  label: string;
  onDoubleClick: () => void;
}

export function DesktopIcon({ appId, label, onDoubleClick }: DesktopIconProps) {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <motion.div
      className="flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer w-20"
      onClick={() => setIsSelected(true)}
      onDoubleClick={onDoubleClick}
      onBlur={() => setIsSelected(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      tabIndex={0}
    >
      <div
        className={`p-1 rounded-lg transition-colors ${
          isSelected ? 'bg-white/20' : ''
        }`}
      >
        <AppIcon appId={appId} size={64} />
      </div>
      <span
        className={`text-xs text-center text-white font-medium px-1 py-0.5 rounded max-w-full truncate ${
          isSelected ? 'bg-[#007aff]' : 'drop-shadow-lg'
        }`}
      >
        {label}
      </span>
    </motion.div>
  );
}
