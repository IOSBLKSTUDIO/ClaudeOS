import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowStore } from '../../stores/windowStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { getAllApps } from '../../config/apps';
import { AppIcon } from '../shared/AppIcon';
import { useTranslation } from '../../i18n/useTranslation';
import type { AppId, SpotlightResult } from '../../types';

export function Spotlight() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const openWindow = useWindowStore((s) => s.openWindow);
  const language = useSettingsStore((s) => s.language);
  const { t } = useTranslation();

  // Search results
  const results = useCallback((): SpotlightResult[] => {
    if (!query.trim()) return [];

    const searchQuery = query.toLowerCase();
    const apps = getAllApps(language);

    const appResults: SpotlightResult[] = apps
      .filter((app) => app.name.toLowerCase().includes(searchQuery))
      .map((app) => ({
        id: app.id,
        type: 'app' as const,
        title: app.name,
        subtitle: t.spotlight.application,
        icon: app.icon,
        action: () => {
          openWindow(app.id);
          setIsOpen(false);
          setQuery('');
        },
      }));

    return appResults.slice(0, 8);
  }, [query, openWindow, language, t]);

  const searchResults = results();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Space to toggle Spotlight
      if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setQuery('');
        setSelectedIndex(0);
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
      }

      // Arrow navigation
      if (isOpen && searchResults.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < searchResults.length - 1 ? prev + 1 : prev
          );
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          searchResults[selectedIndex]?.action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[10000] flex items-start justify-center pt-32"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          setIsOpen(false);
          setQuery('');
        }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Spotlight Container */}
        <motion.div
          className="relative w-[680px] overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(50, 50, 54, 0.98) 0%, rgba(38, 38, 42, 0.98) 100%)',
            backdropFilter: 'blur(80px) saturate(200%)',
            WebkitBackdropFilter: 'blur(80px) saturate(200%)',
            borderRadius: 14,
            border: '0.5px solid rgba(255, 255, 255, 0.12)',
            boxShadow: `
              0 0 0 0.5px rgba(0, 0, 0, 0.4),
              0 40px 100px rgba(0, 0, 0, 0.6),
              0 15px 40px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.08)
            `,
          }}
          initial={{ scale: 0.95, opacity: 0, y: -30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -30 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div
            className="flex items-center gap-4 px-5 py-4"
            style={{
              borderBottom: '0.5px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7 flex-shrink-0"
              style={{ fill: 'rgba(255, 255, 255, 0.4)' }}
            >
              <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.spotlight.placeholder}
              className="flex-1 bg-transparent text-[22px] font-light tracking-[-0.01em] outline-none"
              style={{
                color: 'rgba(255, 255, 255, 0.95)',
              }}
            />
          </div>

          {/* Results */}
          {searchResults.length > 0 && (
            <div className="max-h-[420px] overflow-y-auto py-1.5">
              {searchResults.map((result, index) => (
                <motion.button
                  key={result.id}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left mx-1.5"
                  style={{
                    width: 'calc(100% - 12px)',
                    borderRadius: 8,
                    background:
                      index === selectedIndex
                        ? 'linear-gradient(90deg, #0a84ff 0%, #007aff 100%)'
                        : 'transparent',
                    transition: 'background 0.15s ease',
                  }}
                  onClick={result.action}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <AppIcon appId={result.id as AppId} size={44} />
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[15px] font-medium truncate"
                      style={{
                        color: index === selectedIndex ? '#fff' : 'rgba(255, 255, 255, 0.9)',
                      }}
                    >
                      {result.title}
                    </div>
                    <div
                      className="text-[12px] truncate"
                      style={{
                        color: index === selectedIndex ? 'rgba(255, 255, 255, 0.75)' : 'rgba(255, 255, 255, 0.45)',
                      }}
                    >
                      {result.subtitle}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {query && searchResults.length === 0 && (
            <div
              className="py-10 text-center text-[14px]"
              style={{ color: 'rgba(255, 255, 255, 0.4)' }}
            >
              {t.spotlight.noResults} "{query}"
            </div>
          )}

          {/* Hint */}
          {!query && (
            <div
              className="py-5 px-5 text-center text-[13px]"
              style={{ color: 'rgba(255, 255, 255, 0.35)' }}
            >
              {t.spotlight.hint}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
