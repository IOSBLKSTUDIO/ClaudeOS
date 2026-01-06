import { useState } from 'react';
import { motion } from 'framer-motion';

interface WindowControlsProps {
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  isActive: boolean;
  disableMaximize?: boolean;
}

export function WindowControls({
  onClose,
  onMinimize,
  onMaximize,
  isActive,
  disableMaximize = false,
}: WindowControlsProps) {
  const [isHovered, setIsHovered] = useState(false);

  const buttons = [
    {
      action: onClose,
      activeGradient: 'linear-gradient(180deg, #ff6058 0%, #e8453c 100%)',
      inactiveColor: '#4a4a4c',
      icon: (
        <svg viewBox="0 0 10 10" className="w-[7px] h-[7px]">
          <path
            d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5"
            stroke="rgba(80, 20, 20, 0.8)"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      ),
    },
    {
      action: onMinimize,
      activeGradient: 'linear-gradient(180deg, #ffbd2e 0%, #dea123 100%)',
      inactiveColor: '#4a4a4c',
      icon: (
        <svg viewBox="0 0 10 10" className="w-[7px] h-[7px]">
          <rect
            x="1.5"
            y="4.5"
            width="7"
            height="1.2"
            rx="0.6"
            fill="rgba(120, 70, 0, 0.8)"
          />
        </svg>
      ),
    },
    {
      action: disableMaximize ? () => {} : onMaximize,
      activeGradient: disableMaximize
        ? '#4a4a4c'
        : 'linear-gradient(180deg, #28c940 0%, #1aab29 100%)',
      inactiveColor: '#4a4a4c',
      disabled: disableMaximize,
      icon: disableMaximize ? null : (
        <svg viewBox="0 0 10 10" className="w-[7px] h-[7px]">
          <path
            d="M2.5 3.5L5 1L7.5 3.5M2.5 6.5L5 9L7.5 6.5"
            stroke="rgba(20, 80, 30, 0.8)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      ),
    },
  ];

  return (
    <div
      className="traffic-lights flex items-center gap-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {buttons.map((button, index) => (
        <motion.button
          key={index}
          className="w-3 h-3 rounded-full flex items-center justify-center relative"
          style={{
            background: isActive && !button.disabled ? button.activeGradient : button.inactiveColor,
            boxShadow: isActive && !button.disabled
              ? 'inset 0 0 0 0.5px rgba(0, 0, 0, 0.15), 0 1px 1px rgba(0, 0, 0, 0.1)'
              : 'inset 0 0 0 0.5px rgba(0, 0, 0, 0.2)',
            cursor: button.disabled ? 'default' : 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (!button.disabled) {
              button.action();
            }
          }}
          whileHover={button.disabled ? {} : { scale: 1.1 }}
          whileTap={button.disabled ? {} : { scale: 0.95 }}
        >
          {/* Inner highlight */}
          {isActive && !button.disabled && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%)',
              }}
            />
          )}

          {/* Icon shown on hover */}
          {button.icon && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered && !button.disabled ? 1 : 0 }}
              transition={{ duration: 0.1 }}
            >
              {button.icon}
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  );
}
