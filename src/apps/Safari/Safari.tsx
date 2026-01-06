import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Tab {
  id: string;
  title: string;
  url: string;
  canLoad: boolean;
  favicon?: string;
}

interface Bookmark {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
}

interface BookmarkCategory {
  name: string;
  bookmarks: Bookmark[];
}

// Organized bookmarks by category
const bookmarkCategories: BookmarkCategory[] = [
  {
    name: 'Encyclopedies',
    bookmarks: [
      { id: 'wiki', name: 'Wikipedia', url: 'https://fr.m.wikipedia.org/wiki/Wikip%C3%A9dia:Accueil_principal', icon: 'W', color: '#000000' },
      { id: 'wiktionary', name: 'Wiktionnaire', url: 'https://fr.m.wiktionary.org/wiki/Wiktionnaire:Page_d%27accueil', icon: 'Wt', color: '#4A4A4A' },
      { id: 'wikimedia', name: 'Wikimedia', url: 'https://commons.wikimedia.org/wiki/Main_Page', icon: 'Wm', color: '#006699' },
    ],
  },
  {
    name: 'Actualites',
    bookmarks: [
      { id: 'wikinews', name: 'Wikinews', url: 'https://fr.m.wikinews.org/wiki/Accueil', icon: 'Wn', color: '#990000' },
    ],
  },
  {
    name: 'Outils',
    bookmarks: [
      { id: 'archive', name: 'Archive.org', url: 'https://archive.org', icon: 'A', color: '#428BCA' },
      { id: 'osm', name: 'OpenStreetMap', url: 'https://www.openstreetmap.org/export/embed.html', icon: 'M', color: '#7EBC6F' },
    ],
  },
];

// Flatten bookmarks for quick access
const allBookmarks = bookmarkCategories.flatMap(c => c.bookmarks);

// Sites that typically allow iframe embedding
const allowedSites = [
  'wikipedia.org',
  'archive.org',
  'openstreetmap.org',
  'wikimedia.org',
  'wiktionary.org',
  'wikinews.org',
];

function canSiteBeEmbedded(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return allowedSites.some(site => hostname.includes(site));
  } catch {
    return false;
  }
}

function getFaviconLetter(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return hostname.charAt(0).toUpperCase();
  } catch {
    return 'W';
  }
}

export default function Safari() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'Page de demarrage', url: '', canLoad: true },
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [iframeError, setIframeError] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'bookmarks' | 'history'>('bookmarks');
  const [history, setHistory] = useState<{ title: string; url: string; date: Date }[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // Simulate loading progress
  useEffect(() => {
    if (isLoading) {
      setLoadingProgress(0);
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + Math.random() * 20;
        });
      }, 200);
      return () => clearInterval(interval);
    } else {
      setLoadingProgress(100);
      setTimeout(() => setLoadingProgress(0), 300);
    }
  }, [isLoading]);

  const navigateTo = useCallback((url: string) => {
    let processedUrl = url.trim();
    if (!processedUrl) return;

    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      if (processedUrl.includes('.') && !processedUrl.includes(' ')) {
        processedUrl = 'https://' + processedUrl;
      } else {
        // Use Wikipedia search as fallback since Google doesn't work in iframes
        processedUrl = `https://fr.m.wikipedia.org/w/index.php?search=${encodeURIComponent(processedUrl)}`;
      }
    }

    const canLoad = canSiteBeEmbedded(processedUrl);
    let title = '';
    try {
      title = new URL(processedUrl).hostname.replace('www.', '');
    } catch {
      title = processedUrl;
    }

    setIsLoading(true);
    setIframeError(false);
    setTabs((prevTabs) =>
      prevTabs.map((t) =>
        t.id === activeTabId
          ? { ...t, url: processedUrl, title, canLoad, favicon: getFaviconLetter(processedUrl) }
          : t
      )
    );
    setUrlInput(processedUrl);

    // Add to history
    setHistory(prev => [{ title, url: processedUrl, date: new Date() }, ...prev.slice(0, 49)]);

    setTimeout(() => setIsLoading(false), 1500);
  }, [activeTabId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      navigateTo(urlInput);
    }
  };

  const createTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      title: 'Page de demarrage',
      url: '',
      canLoad: true,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    setUrlInput('');
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) {
      setTabs([{ id: '1', title: 'Page de demarrage', url: '', canLoad: true }]);
      setActiveTabId('1');
      setUrlInput('');
      return;
    }

    const tabIndex = tabs.findIndex(t => t.id === tabId);
    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      const newActiveTab = newTabs[Math.min(tabIndex, newTabs.length - 1)];
      setActiveTabId(newActiveTab.id);
      setUrlInput(newActiveTab.url);
    }
  };

  const goHome = () => {
    setTabs((prevTabs) =>
      prevTabs.map((t) =>
        t.id === activeTabId
          ? { ...t, url: '', title: 'Page de demarrage', canLoad: true }
          : t
      )
    );
    setUrlInput('');
    setIframeError(false);
  };

  const refresh = () => {
    if (iframeRef.current && activeTab?.url) {
      setIsLoading(true);
      iframeRef.current.src = activeTab.url;
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  const goBack = () => {
    // Simple back functionality - go home
    goHome();
  };

  const handleIframeError = () => {
    setIframeError(true);
    setIsLoading(false);
  };

  const formatHistoryDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return "A l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="flex h-full bg-[#1c1c1e]">
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="border-r border-white/10 overflow-hidden flex flex-col"
            style={{ background: 'linear-gradient(180deg, rgba(44, 44, 46, 0.98) 0%, rgba(34, 34, 36, 0.98) 100%)' }}
          >
            {/* Sidebar tabs */}
            <div className="flex border-b border-white/10" style={{ padding: '12px' }}>
              <button
                onClick={() => setSidebarTab('bookmarks')}
                className={`flex-1 text-[12px] font-medium rounded-lg transition-colors ${
                  sidebarTab === 'bookmarks' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/70'
                }`}
                style={{ padding: '8px' }}
              >
                Favoris
              </button>
              <button
                onClick={() => setSidebarTab('history')}
                className={`flex-1 text-[12px] font-medium rounded-lg transition-colors ${
                  sidebarTab === 'history' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/70'
                }`}
                style={{ padding: '8px' }}
              >
                Historique
              </button>
            </div>

            {/* Sidebar content */}
            <div className="flex-1 overflow-auto" style={{ padding: '12px' }}>
              {sidebarTab === 'bookmarks' ? (
                <div>
                  {bookmarkCategories.map((category) => (
                    <div key={category.name} style={{ marginBottom: '20px' }}>
                      <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider" style={{ padding: '0 8px', marginBottom: '8px' }}>
                        {category.name}
                      </div>
                      {category.bookmarks.map((bookmark) => (
                        <button
                          key={bookmark.id}
                          onClick={() => {
                            navigateTo(bookmark.url);
                            setShowSidebar(false);
                          }}
                          className="w-full flex items-center gap-3 rounded-lg text-white/70 hover:bg-white/5 transition-colors"
                          style={{ padding: '8px' }}
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-bold"
                            style={{ backgroundColor: bookmark.color }}
                          >
                            {bookmark.icon}
                          </div>
                          <span className="text-[13px] truncate">{bookmark.name}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  {history.length === 0 ? (
                    <div className="text-center text-white/30 text-[13px]" style={{ padding: '40px 20px' }}>
                      <div className="text-3xl" style={{ marginBottom: '8px' }}>🕐</div>
                      Aucun historique
                    </div>
                  ) : (
                    history.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          navigateTo(item.url);
                          setShowSidebar(false);
                        }}
                        className="w-full flex items-center gap-3 rounded-lg text-white/70 hover:bg-white/5 transition-colors"
                        style={{ padding: '8px', marginBottom: '2px' }}
                      >
                        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/60 text-[11px] font-bold">
                          {item.title.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="text-[13px] truncate text-white/80">{item.title}</div>
                          <div className="text-[11px] text-white/40">{formatHistoryDate(item.date)}</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tab Bar */}
        <div
          className="border-b border-white/10 flex items-center gap-1"
          style={{
            padding: '8px 12px',
            background: 'linear-gradient(180deg, rgba(58, 58, 60, 0.98) 0%, rgba(48, 48, 50, 0.98) 100%)',
          }}
        >
          {/* Sidebar toggle */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`rounded-lg transition-colors ${showSidebar ? 'bg-white/15 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
            style={{ padding: '6px' }}
            title="Afficher la barre laterale"
          >
            <svg viewBox="0 0 18 18" className="w-4 h-4">
              <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M6 3v12" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>

          <div className="w-px h-5 bg-white/10" style={{ margin: '0 6px' }} />

          {/* Tabs */}
          <div className="flex-1 flex items-center gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <motion.div
                key={tab.id}
                className={`group flex items-center gap-2 rounded-lg text-[12px] cursor-pointer min-w-0 ${
                  tab.id === activeTabId
                    ? 'bg-white/15 text-white'
                    : 'text-white/50 hover:bg-white/5 hover:text-white/70'
                }`}
                style={{ padding: '6px 10px', maxWidth: '180px' }}
                onClick={() => {
                  setActiveTabId(tab.id);
                  setUrlInput(tab.url);
                  setIframeError(false);
                }}
                whileTap={{ scale: 0.98 }}
                layout
              >
                {tab.url ? (
                  <div
                    className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: '#007AFF' }}
                  >
                    {tab.favicon || 'W'}
                  </div>
                ) : (
                  <svg viewBox="0 0 18 18" className="w-5 h-5 flex-shrink-0 text-white/40">
                    <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <path d="M9 5l1 4-4 1 1-4z" fill="currentColor"/>
                  </svg>
                )}
                <span className="truncate flex-1">{tab.title}</span>
                <button
                  className="opacity-0 group-hover:opacity-100 hover:bg-white/20 rounded transition-opacity flex-shrink-0"
                  style={{ padding: '2px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                >
                  <svg viewBox="0 0 12 12" className="w-3 h-3">
                    <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </motion.div>
            ))}
          </div>

          {/* New tab button */}
          <button
            className="rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors flex-shrink-0"
            style={{ padding: '6px' }}
            onClick={createTab}
            title="Nouvel onglet"
          >
            <svg viewBox="0 0 16 16" className="w-4 h-4">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* URL Bar */}
        <div
          className="border-b border-white/10 flex items-center gap-3"
          style={{
            padding: '10px 16px',
            background: 'linear-gradient(180deg, rgba(50, 50, 52, 0.98) 0%, rgba(44, 44, 46, 0.98) 100%)',
          }}
        >
          {/* Navigation buttons */}
          <div className="flex items-center gap-1">
            <button
              className="rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors"
              style={{ padding: '6px' }}
              onClick={goBack}
              title="Page precedente"
            >
              <svg viewBox="0 0 18 18" className="w-4 h-4">
                <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              className="rounded-lg text-white/30 cursor-not-allowed"
              style={{ padding: '6px' }}
              disabled
              title="Page suivante"
            >
              <svg viewBox="0 0 18 18" className="w-4 h-4">
                <path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* URL Input */}
          <div className="flex-1 relative">
            <div className="flex items-center gap-2 bg-[#1c1c1e] rounded-xl border border-white/10 focus-within:border-[#007AFF]/50 transition-colors" style={{ padding: '8px 14px' }}>
              {activeTab?.url && activeTab.canLoad && !iframeError ? (
                <svg viewBox="0 0 16 16" className="w-4 h-4 text-green-500 flex-shrink-0">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 1a6 6 0 110 12A6 6 0 018 2z" fill="currentColor"/>
                  <path d="M6.5 8l1.5 1.5 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : isLoading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-[#007AFF] rounded-full animate-spin flex-shrink-0" />
              ) : (
                <svg viewBox="0 0 16 16" className="w-4 h-4 text-white/30 flex-shrink-0">
                  <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M10 10l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Rechercher ou saisir une adresse"
                className="flex-1 bg-transparent text-white text-[13px] outline-none placeholder-white/30"
              />
              {urlInput && (
                <button
                  onClick={() => setUrlInput('')}
                  className="text-white/30 hover:text-white/50 transition-colors flex-shrink-0"
                >
                  <svg viewBox="0 0 16 16" className="w-4 h-4">
                    <circle cx="8" cy="8" r="6" fill="currentColor" opacity="0.3"/>
                    <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Loading progress bar */}
            {loadingProgress > 0 && loadingProgress < 100 && (
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-[#007AFF] rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.2 }}
              />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              className="rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors"
              style={{ padding: '6px' }}
              onClick={refresh}
              title="Actualiser"
            >
              <svg viewBox="0 0 18 18" className="w-4 h-4">
                <path d="M15 9A6 6 0 119 3m6 0v3h-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              className="rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors"
              style={{ padding: '6px' }}
              onClick={goHome}
              title="Page de demarrage"
            >
              <svg viewBox="0 0 18 18" className="w-4 h-4">
                <path d="M3 9l6-6 6 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 8v6a1 1 0 001 1h6a1 1 0 001-1V8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative" style={{ background: '#1c1c1e' }}>
          {activeTab?.url ? (
            <>
              {/* Loading overlay */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[#1c1c1e] flex items-center justify-center z-10"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full border-3 border-white/10" />
                        <div className="w-12 h-12 rounded-full border-3 border-transparent border-t-[#007AFF] animate-spin absolute inset-0" />
                      </div>
                      <span className="text-white/50 text-[13px]">Chargement...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Show iframe for allowed sites */}
              {activeTab.canLoad && !iframeError ? (
                <iframe
                  ref={iframeRef}
                  src={activeTab.url}
                  className="w-full h-full border-none"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  onError={handleIframeError}
                  onLoad={() => setIsLoading(false)}
                  title="Browser content"
                />
              ) : (
                /* Cannot load message */
                <div className="h-full flex flex-col items-center justify-center" style={{ padding: '40px' }}>
                  <div
                    className="w-24 h-24 rounded-3xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', marginBottom: '24px' }}
                  >
                    <svg viewBox="0 0 48 48" className="w-12 h-12 text-white">
                      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                      <path d="M24 14v14" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                      <circle cx="24" cy="34" r="2" fill="currentColor"/>
                    </svg>
                  </div>
                  <h2 className="text-white text-xl font-semibold" style={{ marginBottom: '8px' }}>
                    Page non disponible
                  </h2>
                  <p className="text-white/40 text-[14px] text-center max-w-md" style={{ marginBottom: '24px' }}>
                    Ce site ne peut pas etre affiche ici en raison de restrictions de securite (CORS/X-Frame-Options).
                  </p>
                  <div className="flex gap-3">
                    <a
                      href={activeTab.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-[#007AFF] text-white text-[13px] font-medium rounded-xl hover:bg-[#0066DD] transition-colors"
                      style={{ padding: '10px 20px' }}
                    >
                      <svg viewBox="0 0 16 16" className="w-4 h-4">
                        <path d="M6 3h7v7M13 3L6 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Ouvrir dans un nouvel onglet
                    </a>
                    <button
                      onClick={goHome}
                      className="bg-white/10 text-white text-[13px] font-medium rounded-xl hover:bg-white/15 transition-colors"
                      style={{ padding: '10px 20px' }}
                    >
                      Retour a l'accueil
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Start Page */
            <div className="h-full overflow-auto flex items-center justify-center">
              <div className="w-full max-w-3xl" style={{ padding: '60px 24px' }}>
                {/* Safari logo and title */}
                <div className="flex flex-col items-center" style={{ marginBottom: '48px' }}>
                  <div
                    className="w-20 h-20 rounded-[22px] flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #007AFF 0%, #00C7BE 100%)',
                      boxShadow: '0 8px 32px rgba(0, 122, 255, 0.3)',
                      marginBottom: '16px',
                    }}
                  >
                    <svg viewBox="0 0 48 48" className="w-10 h-10 text-white">
                      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <path d="M24 10l2 8 8-2-6 6 6 6-8-2-2 8-2-8-8 2 6-6-6-6 8 2z" fill="currentColor"/>
                    </svg>
                  </div>
                  <h1 className="text-white text-2xl font-semibold">Safari</h1>
                </div>

                {/* Search bar */}
                <div style={{ marginBottom: '48px' }}>
                  <div
                    className="flex items-center gap-3 bg-[#2c2c2e] rounded-2xl border border-white/10 focus-within:border-[#007AFF]/50 transition-colors"
                    style={{ padding: '14px 20px' }}
                  >
                    <svg viewBox="0 0 18 18" className="w-5 h-5 text-white/30 flex-shrink-0">
                      <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                      <path d="M11.5 11.5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Rechercher ou saisir une adresse"
                      className="flex-1 bg-transparent text-white text-[15px] outline-none placeholder-white/30"
                    />
                  </div>
                </div>

                {/* Favorites */}
                <div style={{ marginBottom: '48px' }}>
                  <h2 className="text-white/40 text-[11px] font-semibold uppercase tracking-wider" style={{ marginBottom: '16px', paddingLeft: '4px' }}>
                    Favoris
                  </h2>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                    {allBookmarks.map((bookmark) => (
                      <motion.button
                        key={bookmark.id}
                        className="flex flex-col items-center gap-2 rounded-2xl hover:bg-white/5 transition-colors"
                        style={{ padding: '16px 8px' }}
                        onClick={() => navigateTo(bookmark.url)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold"
                          style={{
                            backgroundColor: bookmark.color,
                            boxShadow: `0 4px 16px ${bookmark.color}40`,
                          }}
                        >
                          {bookmark.icon}
                        </div>
                        <span className="text-white/70 text-[12px] text-center truncate w-full">
                          {bookmark.name}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Tip */}
                <div className="flex items-center justify-center gap-2 text-white/20 text-[12px]">
                  <svg viewBox="0 0 16 16" className="w-4 h-4">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span>Wikipedia, Wikimedia et Archive.org fonctionnent dans Safari</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
