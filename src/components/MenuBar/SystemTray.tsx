import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function SystemTray() {
  const [time, setTime] = useState(new Date());
  const [batteryLevel] = useState(87);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      {/* Battery */}
      <div className="flex items-center gap-1">
        <div className="relative w-6 h-3 border border-white/60 rounded-sm">
          <div
            className="absolute inset-0.5 bg-white/80 rounded-sm"
            style={{ width: `${batteryLevel}%` }}
          />
          <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-0.5 h-1.5 bg-white/60 rounded-r" />
        </div>
        <span className="text-white/80 text-xs">{batteryLevel}%</span>
      </div>

      {/* WiFi */}
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4 fill-current text-white/80"
      >
        <path d="M12 18c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-5.27-3.54l1.42 1.41C9.08 16.79 10.5 17.5 12 17.5s2.92-.71 3.85-1.63l1.42-1.41C15.93 15.79 14.04 17 12 17s-3.93-1.21-5.27-2.54zM12 10c3.03 0 5.78 1.23 7.76 3.22l1.41-1.41C18.68 9.32 15.52 8 12 8s-6.68 1.32-9.17 3.81l1.41 1.41C6.22 11.23 8.97 10 12 10zm0-5c4.42 0 8.42 1.79 11.31 4.69l1.41-1.41C21.47 5.03 16.95 3 12 3S2.53 5.03-.28 8.28l1.41 1.41C4.03 6.79 7.58 5 12 5z" />
      </svg>

      {/* Bluetooth */}
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4 fill-current text-white/80"
      >
        <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z" />
      </svg>

      {/* Control Center */}
      <motion.button
        className="hover:bg-white/10 p-1 rounded"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-white/80">
          <path d="M7 11v2h2v-2H7zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2zM5 15v2h2v-2H5zm4 0v2h2v-2H9zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2zM7 7v2h2V7H7zm4 0v2h2V7h-2zm4 0v2h2V7h-2z" />
        </svg>
      </motion.button>

      {/* Spotlight */}
      <motion.button
        className="hover:bg-white/10 p-1 rounded"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-white/80">
          <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
      </motion.button>

      {/* Date & Time */}
      <div className="flex items-center gap-2">
        <span className="text-white/80">{formatDate(time)}</span>
        <span className="font-medium">{formatTime(time)}</span>
      </div>
    </div>
  );
}
