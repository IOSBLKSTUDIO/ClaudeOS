import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { DockItem as DockItemType } from '../../types';
import { AppIcon } from '../shared/AppIcon';

interface DockItemProps {
  item: DockItemType;
  baseSize: number;
  onClick: () => void;
}

export function DockItem({
  item,
  baseSize,
  onClick,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isItemHovered, setIsItemHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      className="relative flex flex-col items-center cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => setIsItemHovered(true)}
      onMouseLeave={() => setIsItemHovered(false)}
      whileTap={{ scale: 0.9 }}
      animate={{
        scale: isItemHovered ? 1.3 : 1,
        y: isItemHovered ? -10 : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 17,
      }}
      style={{
        originY: 1,
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: baseSize,
          height: baseSize,
        }}
      >
        <AppIcon appId={item.appId} size={baseSize} className="w-full h-full" />
      </div>

      {/* Running indicator dot */}
      {item.isRunning && (
        <motion.div
          className="absolute -bottom-1 w-[5px] h-[5px] rounded-full"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 0 6px rgba(255, 255, 255, 0.6)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
        />
      )}
    </motion.div>
  );
}
