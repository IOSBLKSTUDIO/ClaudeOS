import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowStore } from '../../stores/windowStore';
import type { AppId } from '../../types';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'app';
  extension?: string;
  appId?: string;
  icon?: string;
  size?: string;
  modified?: string;
  color?: string;
  tags?: string[];
}

// App icons configuration
const appIcons: Record<string, { gradient: string[]; icon: React.ReactNode }> = {
  finder: {
    gradient: ['#1E90FF', '#00BFFF'],
    icon: (
      <svg viewBox="0 0 32 32" fill="white" className="w-6 h-6">
        <path d="M8 6h16a2 2 0 012 2v16a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" fill="none" stroke="white" strokeWidth="1.5"/>
        <circle cx="12" cy="13" r="2" />
        <circle cx="20" cy="13" r="2" />
        <path d="M10 19c2 2 10 2 12 0" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  terminal: {
    gradient: ['#1C1C1E', '#2C2C2E'],
    icon: (
      <svg viewBox="0 0 32 32" fill="white" className="w-6 h-6">
        <path d="M8 12l6 4-6 4" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 20h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  safari: {
    gradient: ['#006CFF', '#00D4FF'],
    icon: (
      <svg viewBox="0 0 32 32" fill="white" className="w-6 h-6">
        <circle cx="16" cy="16" r="10" fill="none" stroke="white" strokeWidth="1.5"/>
        <path d="M16 8l2 8-8 2 2-8z" fill="white"/>
        <path d="M18 18l-6-6" stroke="white" strokeWidth="1"/>
      </svg>
    ),
  },
  notes: {
    gradient: ['#FFB800', '#FF9500'],
    icon: (
      <svg viewBox="0 0 32 32" fill="white" className="w-6 h-6">
        <path d="M10 8h12a1 1 0 011 1v14a1 1 0 01-1 1H10a1 1 0 01-1-1V9a1 1 0 011-1z" fill="none" stroke="white" strokeWidth="1.5"/>
        <path d="M12 12h8M12 16h8M12 20h5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  calculator: {
    gradient: ['#FF9500', '#FF6B00'],
    icon: (
      <svg viewBox="0 0 32 32" fill="white" className="w-6 h-6">
        <rect x="9" y="6" width="14" height="20" rx="2" fill="none" stroke="white" strokeWidth="1.5"/>
        <rect x="11" y="8" width="10" height="5" rx="1" fill="white" opacity="0.6"/>
        <circle cx="13" cy="16" r="1.2" fill="white"/>
        <circle cx="16" cy="16" r="1.2" fill="white"/>
        <circle cx="19" cy="16" r="1.2" fill="white"/>
        <circle cx="13" cy="20" r="1.2" fill="white"/>
        <circle cx="16" cy="20" r="1.2" fill="white"/>
        <circle cx="19" cy="20" r="1.2" fill="white"/>
        <circle cx="13" cy="24" r="1.2" fill="white"/>
        <rect x="15.5" y="23" width="4" height="2" rx="1" fill="white"/>
      </svg>
    ),
  },
  music: {
    gradient: ['#FA2D48', '#FF6482'],
    icon: (
      <svg viewBox="0 0 32 32" fill="white" className="w-6 h-6">
        <path d="M12 22V10l10-2v12" fill="none" stroke="white" strokeWidth="1.5"/>
        <circle cx="10" cy="22" r="3" fill="white"/>
        <circle cx="20" cy="20" r="3" fill="white"/>
      </svg>
    ),
  },
  photos: {
    gradient: ['#FF375F', '#FF9F0A', '#30D158', '#64D2FF'],
    icon: (
      <svg viewBox="0 0 32 32" fill="white" className="w-6 h-6">
        <circle cx="16" cy="16" r="10" fill="none" stroke="white" strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="4" fill="white"/>
        <path d="M16 6v3M16 23v3M6 16h3M23 16h3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  settings: {
    gradient: ['#8E8E93', '#636366'],
    icon: (
      <svg viewBox="0 0 32 32" fill="white" className="w-6 h-6">
        <circle cx="16" cy="16" r="4" fill="none" stroke="white" strokeWidth="1.5"/>
        <path d="M16 6v2M16 24v2M6 16h2M24 16h2M8.93 8.93l1.41 1.41M21.66 21.66l1.41 1.41M8.93 23.07l1.41-1.41M21.66 10.34l1.41-1.41" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  snake: {
    gradient: ['#10b981', '#059669'],
    icon: (
      <svg viewBox="0 0 32 32" fill="white" className="w-6 h-6">
        <path d="M8 18 L8 12 L14 12 L14 18 L20 18 L20 12 L26 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="26" cy="12" r="3" fill="white"/>
        <circle cx="8" cy="22" r="2" fill="#ef4444"/>
      </svg>
    ),
  },
};

// File extension icons configuration
const getFileIcon = (extension?: string) => {
  switch (extension?.toLowerCase()) {
    case 'pdf':
      return { color: '#FF3B30', label: 'PDF' };
    case 'doc':
    case 'docx':
      return { color: '#2B579A', label: 'DOC' };
    case 'xls':
    case 'xlsx':
      return { color: '#217346', label: 'XLS' };
    case 'ppt':
    case 'pptx':
      return { color: '#D24726', label: 'PPT' };
    case 'txt':
      return { color: '#8E8E93', label: 'TXT' };
    case 'md':
      return { color: '#5856D6', label: 'MD' };
    case 'zip':
    case 'rar':
    case '7z':
      return { color: '#AF52DE', label: 'ZIP' };
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return { color: '#34C759', label: 'IMG', isImage: true };
    case 'mp3':
    case 'wav':
    case 'aac':
      return { color: '#FF2D55', label: 'MP3' };
    case 'mp4':
    case 'mov':
    case 'avi':
      return { color: '#5856D6', label: 'VID' };
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
      return { color: '#F7DF1E', label: 'JS' };
    case 'html':
      return { color: '#E34F26', label: 'HTML' };
    case 'css':
      return { color: '#1572B6', label: 'CSS' };
    case 'json':
      return { color: '#8E8E93', label: 'JSON' };
    default:
      return { color: '#8E8E93', label: 'FILE' };
  }
};

const mockFiles: Record<string, FileItem[]> = {
  '/': [
    { id: '1', name: 'Applications', type: 'folder', color: '#007AFF', modified: '12 jan 2025', size: '--' },
    { id: '2', name: 'Documents', type: 'folder', color: '#5856D6', modified: '10 jan 2025', size: '--' },
    { id: '3', name: 'Telechargements', type: 'folder', color: '#34C759', modified: '11 jan 2025', size: '--' },
    { id: '4', name: 'Bureau', type: 'folder', color: '#FF9500', modified: '12 jan 2025', size: '--' },
    { id: '5', name: 'Images', type: 'folder', color: '#FF2D55', modified: '9 jan 2025', size: '--' },
    { id: '6', name: 'Musique', type: 'folder', color: '#AF52DE', modified: '8 jan 2025', size: '--' },
  ],
  '/Applications': [
    { id: 'a1', name: 'Finder', type: 'app', appId: 'finder', modified: '1 jan 2025', size: '12 Mo' },
    { id: 'a2', name: 'Terminal', type: 'app', appId: 'terminal', modified: '1 jan 2025', size: '8 Mo' },
    { id: 'a3', name: 'Safari', type: 'app', appId: 'safari', modified: '1 jan 2025', size: '45 Mo' },
    { id: 'a4', name: 'Notes', type: 'app', appId: 'notes', modified: '1 jan 2025', size: '15 Mo' },
    { id: 'a5', name: 'Calculette', type: 'app', appId: 'calculator', modified: '1 jan 2025', size: '5 Mo' },
    { id: 'a6', name: 'Musique', type: 'app', appId: 'music', modified: '1 jan 2025', size: '52 Mo' },
    { id: 'a7', name: 'Photos', type: 'app', appId: 'photos', modified: '1 jan 2025', size: '120 Mo' },
    { id: 'a8', name: 'Preferences Systeme', type: 'app', appId: 'settings', modified: '1 jan 2025', size: '18 Mo' },
    { id: 'a9', name: 'Snake', type: 'app', appId: 'snake', modified: '6 jan 2026', size: '6 Mo' },
  ],
  '/Documents': [
    { id: 'd1', name: 'README.txt', type: 'file', extension: 'txt', modified: '5 jan 2025', size: '2 Ko', tags: ['important'] },
    { id: 'd2', name: 'Projets', type: 'folder', color: '#007AFF', modified: '8 jan 2025', size: '--' },
    { id: 'd3', name: 'Travail', type: 'folder', color: '#FF9500', modified: '10 jan 2025', size: '--' },
    { id: 'd4', name: 'Notes.md', type: 'file', extension: 'md', modified: '6 jan 2025', size: '4 Ko' },
    { id: 'd5', name: 'Budget_2025.xlsx', type: 'file', extension: 'xlsx', modified: '7 jan 2025', size: '156 Ko', tags: ['travail'] },
    { id: 'd6', name: 'Contrat.pdf', type: 'file', extension: 'pdf', modified: '3 jan 2025', size: '2.4 Mo', tags: ['important'] },
    { id: 'd7', name: 'Rapport_Final.docx', type: 'file', extension: 'docx', modified: '4 jan 2025', size: '845 Ko' },
  ],
  '/Telechargements': [
    { id: 'dl1', name: 'photo-vacances.png', type: 'file', extension: 'png', modified: '11 jan 2025', size: '2.4 Mo' },
    { id: 'dl2', name: 'facture.pdf', type: 'file', extension: 'pdf', modified: '10 jan 2025', size: '845 Ko' },
    { id: 'dl3', name: 'archive.zip', type: 'file', extension: 'zip', modified: '9 jan 2025', size: '12 Mo' },
    { id: 'dl4', name: 'presentation.pptx', type: 'file', extension: 'pptx', modified: '8 jan 2025', size: '5.2 Mo' },
    { id: 'dl5', name: 'musique.mp3', type: 'file', extension: 'mp3', modified: '7 jan 2025', size: '8.5 Mo' },
    { id: 'dl6', name: 'video.mp4', type: 'file', extension: 'mp4', modified: '6 jan 2025', size: '156 Mo' },
  ],
  '/Bureau': [
    { id: 'desk1', name: 'Capture ecran.png', type: 'file', extension: 'png', modified: '12 jan 2025', size: '1.2 Mo' },
    { id: 'desk2', name: 'Todo.txt', type: 'file', extension: 'txt', modified: '12 jan 2025', size: '1 Ko' },
  ],
  '/Images': [
    { id: 'p1', name: 'Captures ecran', type: 'folder', color: '#FF2D55', modified: '9 jan 2025', size: '--' },
    { id: 'p2', name: 'Fonds ecran', type: 'folder', color: '#5856D6', modified: '7 jan 2025', size: '--' },
    { id: 'p3', name: 'Vacances 2024', type: 'folder', color: '#34C759', modified: '6 jan 2025', size: '--' },
    { id: 'p4', name: 'avatar.jpg', type: 'file', extension: 'jpg', modified: '5 jan 2025', size: '245 Ko' },
  ],
  '/Musique': [
    { id: 'm1', name: 'Playlists', type: 'folder', color: '#AF52DE', modified: '8 jan 2025', size: '--' },
    { id: 'm2', name: 'iTunes Media', type: 'folder', color: '#FF2D55', modified: '5 jan 2025', size: '--' },
    { id: 'm3', name: 'podcast.mp3', type: 'file', extension: 'mp3', modified: '4 jan 2025', size: '45 Mo' },
  ],
};

const tags = [
  { id: 'red', color: '#FF3B30', name: 'Rouge' },
  { id: 'orange', color: '#FF9500', name: 'Orange' },
  { id: 'yellow', color: '#FFCC00', name: 'Jaune' },
  { id: 'green', color: '#34C759', name: 'Vert' },
  { id: 'blue', color: '#007AFF', name: 'Bleu' },
  { id: 'purple', color: '#5856D6', name: 'Violet' },
  { id: 'pink', color: '#FF2D55', name: 'Rose' },
  { id: 'gray', color: '#8E8E93', name: 'Gris' },
];

type ViewMode = 'icons' | 'list' | 'columns' | 'gallery';

export default function Finder() {
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('icons');
  const [showPreview, setShowPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'kind'>('name');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [files, setFiles] = useState(mockFiles);

  const currentFiles = files[currentPath] || [];
  const selectedFileData = currentFiles.find(f => f.id === selectedFile);

  // Sort files
  const sortedFiles = [...currentFiles].sort((a, b) => {
    // Folders first
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;

    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
        return (b.modified || '').localeCompare(a.modified || '');
      case 'size':
        return (b.size || '').localeCompare(a.size || '');
      default:
        return 0;
    }
  });

  // Filter by search
  const filteredFiles = searchQuery
    ? sortedFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : sortedFiles;

  const openWindow = useWindowStore((s) => s.openWindow);

  const handleFileDoubleClick = (file: FileItem) => {
    if (file.type === 'folder') {
      const newPath = currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`;
      if (files[newPath]) {
        setCurrentPath(newPath);
        setSelectedFile(null);
      }
    } else if (file.type === 'app' && file.appId) {
      openWindow(file.appId as AppId);
    }
  };

  const navigateUp = () => {
    const parts = currentPath.split('/').filter(Boolean);
    if (parts.length > 0) {
      parts.pop();
      setCurrentPath(parts.length ? '/' + parts.join('/') : '/');
      setSelectedFile(null);
    }
  };

  const navigateTo = (path: string) => {
    setCurrentPath(path);
    setSelectedFile(null);
  };

  const getBreadcrumbs = () => {
    const parts = currentPath.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Macintosh HD', path: '/' }];
    let currentBreadcrumbPath = '';
    parts.forEach(part => {
      currentBreadcrumbPath += '/' + part;
      breadcrumbs.push({ name: part, path: currentBreadcrumbPath });
    });
    return breadcrumbs;
  };

  const createNewFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder: FileItem = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      type: 'folder',
      color: '#007AFF',
      modified: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
      size: '--',
    };

    setFiles(prev => ({
      ...prev,
      [currentPath]: [...(prev[currentPath] || []), newFolder],
    }));

    setShowNewFolderModal(false);
    setNewFolderName('');
  };

  const deleteSelectedFile = () => {
    if (!selectedFile) return;

    setFiles(prev => ({
      ...prev,
      [currentPath]: prev[currentPath].filter(f => f.id !== selectedFile),
    }));
    setSelectedFile(null);
  };

  const sidebarSections = [
    {
      title: 'Favoris',
      items: [
        { id: 'airdrop', name: 'AirDrop', icon: 'airdrop', path: null },
        { id: 'recents', name: 'Recents', icon: 'clock', path: null },
        { id: 'applications', name: 'Applications', icon: 'apps', path: '/Applications' },
        { id: 'desktop', name: 'Bureau', icon: 'desktop', path: '/Bureau' },
        { id: 'documents', name: 'Documents', icon: 'documents', path: '/Documents' },
        { id: 'downloads', name: 'Telechargements', icon: 'downloads', path: '/Telechargements' },
      ],
    },
    {
      title: 'iCloud',
      items: [
        { id: 'icloud', name: 'iCloud Drive', icon: 'cloud', path: null },
      ],
    },
    {
      title: 'Emplacements',
      items: [
        { id: 'macintosh', name: 'Macintosh HD', icon: 'hdd', path: '/' },
      ],
    },
  ];

  return (
    <div className="flex h-full bg-[#1e1e1e] select-none">
      {/* Sidebar */}
      <div
        className="w-52 flex-shrink-0 border-r border-white/10 overflow-y-auto flex flex-col"
        style={{
          background: 'linear-gradient(180deg, rgba(50, 50, 52, 0.98) 0%, rgba(40, 40, 42, 0.98) 100%)',
        }}
      >
        <div style={{ padding: '16px 0' }}>
          {sidebarSections.map((section, sectionIndex) => (
            <div key={section.title} style={{ marginTop: sectionIndex > 0 ? '20px' : '0' }}>
              <div style={{ padding: '0 16px', marginBottom: '8px' }}>
                <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                  {section.title}
                </span>
              </div>
              <div style={{ padding: '0 8px' }}>
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    className={`w-full flex items-center gap-3 rounded-lg transition-all ${
                      item.path === currentPath
                        ? 'bg-white/15 text-white'
                        : item.path
                          ? 'text-white/70 hover:bg-white/5'
                          : 'text-white/40 cursor-not-allowed'
                    }`}
                    style={{ padding: '8px 10px', marginBottom: '2px' }}
                    onClick={() => item.path && navigateTo(item.path)}
                    disabled={!item.path}
                  >
                    <SidebarIcon type={item.icon} active={item.path === currentPath} />
                    <span className="text-[13px] truncate">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tags section */}
        <div style={{ padding: '0 16px 16px', marginTop: 'auto' }}>
          <div style={{ marginBottom: '10px' }}>
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
              Tags
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <button
                key={tag.id}
                className="w-4 h-4 rounded-full hover:scale-125 transition-transform ring-2 ring-transparent hover:ring-white/30"
                style={{ background: tag.color }}
                title={tag.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div
          className="border-b border-white/10 flex items-center gap-3"
          style={{
            padding: '10px 16px',
            background: 'linear-gradient(180deg, rgba(58, 58, 60, 0.98) 0%, rgba(48, 48, 50, 0.98) 100%)',
          }}
        >
          {/* Navigation buttons */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={navigateUp}
              disabled={currentPath === '/'}
              tooltip="Precedent"
            >
              <svg viewBox="0 0 20 20" className="w-4 h-4">
                <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton disabled tooltip="Suivant">
              <svg viewBox="0 0 20 20" className="w-4 h-4">
                <path d="M7.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </ToolbarButton>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {getBreadcrumbs().map((crumb, index, arr) => (
              <div key={crumb.path} className="flex items-center gap-1 min-w-0">
                {index > 0 && (
                  <svg viewBox="0 0 16 16" className="w-3 h-3 text-white/30 flex-shrink-0">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                <button
                  onClick={() => navigateTo(crumb.path)}
                  className={`text-[13px] truncate transition-colors ${
                    index === arr.length - 1
                      ? 'font-medium text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {index === 0 && (
                    <span className="inline-flex items-center gap-1.5">
                      <FolderIcon size={16} color="#8E8E93" />
                      {crumb.name}
                    </span>
                  )}
                  {index > 0 && crumb.name}
                </button>
              </div>
            ))}
          </div>

          {/* View mode buttons */}
          <div className="flex items-center bg-black/20 rounded-lg" style={{ padding: '3px' }}>
            {[
              { mode: 'icons' as ViewMode, icon: <IconsViewIcon />, tooltip: 'Icones' },
              { mode: 'list' as ViewMode, icon: <ListViewIcon />, tooltip: 'Liste' },
              { mode: 'columns' as ViewMode, icon: <ColumnsViewIcon />, tooltip: 'Colonnes' },
              { mode: 'gallery' as ViewMode, icon: <GalleryViewIcon />, tooltip: 'Galerie' },
            ].map(({ mode, icon, tooltip }) => (
              <ViewModeButton
                key={mode}
                active={viewMode === mode}
                onClick={() => setViewMode(mode)}
                tooltip={tooltip}
              >
                {icon}
              </ViewModeButton>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => setShowNewFolderModal(true)}
              tooltip="Nouveau dossier"
            >
              <svg viewBox="0 0 20 20" className="w-4 h-4">
                <path d="M4 6h5l2 2h5a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M10 11v3M8.5 12.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={deleteSelectedFile}
              disabled={!selectedFile}
              tooltip="Supprimer"
            >
              <svg viewBox="0 0 20 20" className="w-4 h-4">
                <path d="M6 6v9a1 1 0 001 1h6a1 1 0 001-1V6M4 6h12M8 6V4a1 1 0 011-1h2a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
            </ToolbarButton>
          </div>

          {/* Sort dropdown */}
          <select
            className="bg-black/20 text-white/80 text-[12px] rounded-lg border-none outline-none cursor-pointer hover:bg-black/30 transition-colors"
            style={{ padding: '6px 10px' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          >
            <option value="name">Nom</option>
            <option value="date">Date</option>
            <option value="size">Taille</option>
            <option value="kind">Type</option>
          </select>

          {/* Preview toggle */}
          <ToolbarButton
            onClick={() => setShowPreview(!showPreview)}
            active={showPreview}
            tooltip="Apercu"
          >
            <svg viewBox="0 0 20 20" className="w-4 h-4">
              <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <line x1="12" y1="3" x2="12" y2="17" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </ToolbarButton>

          {/* Search */}
          <div className="relative">
            <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <line x1="12" y1="12" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Rechercher"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-36 bg-black/30 text-white text-[12px] rounded-lg outline-none placeholder:text-white/30 focus:w-48 focus:bg-black/40 focus:ring-1 focus:ring-[#007AFF]/50 transition-all"
              style={{ padding: '7px 10px 7px 28px' }}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Files */}
          <div
            className="flex-1 overflow-auto"
            style={{
              padding: '20px',
              background: 'linear-gradient(180deg, #2d2d30 0%, #252528 100%)',
            }}
          >
            {filteredFiles.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/40" style={{ padding: '40px' }}>
                <svg viewBox="0 0 64 64" className="w-20 h-20 mb-4 opacity-40">
                  <path d="M12 18h40v34a4 4 0 01-4 4H16a4 4 0 01-4-4V18z" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 18h48l-4-8H12l-4 8z" fill="none" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span className="text-[14px]">
                  {searchQuery ? 'Aucun resultat' : 'Ce dossier est vide'}
                </span>
              </div>
            ) : viewMode === 'icons' ? (
              <IconsView
                files={filteredFiles}
                selectedFile={selectedFile}
                onSelect={setSelectedFile}
                onDoubleClick={handleFileDoubleClick}
              />
            ) : viewMode === 'list' ? (
              <ListView
                files={filteredFiles}
                selectedFile={selectedFile}
                onSelect={setSelectedFile}
                onDoubleClick={handleFileDoubleClick}
              />
            ) : viewMode === 'columns' ? (
              <ColumnsView
                files={filteredFiles}
                selectedFile={selectedFile}
                onSelect={setSelectedFile}
                onDoubleClick={handleFileDoubleClick}
              />
            ) : (
              <GalleryView
                files={filteredFiles}
                selectedFile={selectedFile}
                onSelect={setSelectedFile}
                onDoubleClick={handleFileDoubleClick}
              />
            )}
          </div>

          {/* Preview Panel */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="border-l border-white/10 overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, rgba(50, 50, 52, 0.98) 0%, rgba(40, 40, 42, 0.98) 100%)',
                }}
              >
                <PreviewPanel file={selectedFileData} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Bar */}
        <div
          className="border-t border-white/10 flex items-center text-[11px] text-white/50"
          style={{
            padding: '6px 16px',
            background: 'linear-gradient(180deg, rgba(48, 48, 50, 0.98) 0%, rgba(38, 38, 40, 0.98) 100%)',
          }}
        >
          <span>
            {filteredFiles.length} element{filteredFiles.length !== 1 ? 's' : ''}
            {selectedFile && ` • 1 selectionne`}
          </span>
        </div>
      </div>

      {/* New Folder Modal */}
      <AnimatePresence>
        {showNewFolderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowNewFolderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#2c2c2e] rounded-xl border border-white/10"
              style={{ padding: '24px', width: '320px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-white text-[15px] font-semibold" style={{ marginBottom: '16px' }}>
                Nouveau dossier
              </h3>
              <input
                type="text"
                placeholder="Nom du dossier"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createNewFolder()}
                className="w-full bg-black/30 text-white text-[13px] rounded-lg outline-none placeholder:text-white/30 focus:ring-1 focus:ring-[#007AFF]/50"
                style={{ padding: '10px 14px', marginBottom: '20px' }}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  className="text-white/70 text-[13px] rounded-lg hover:bg-white/10 transition-colors"
                  style={{ padding: '8px 16px' }}
                  onClick={() => setShowNewFolderModal(false)}
                >
                  Annuler
                </button>
                <button
                  className="bg-[#007AFF] text-white text-[13px] font-medium rounded-lg hover:bg-[#0066DD] transition-colors"
                  style={{ padding: '8px 16px' }}
                  onClick={createNewFolder}
                >
                  Creer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// View mode icons
function IconsViewIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor"/>
    </svg>
  );
}

function ListViewIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5">
      <rect x="1" y="2" width="14" height="2.5" rx="0.5" fill="currentColor"/>
      <rect x="1" y="6.75" width="14" height="2.5" rx="0.5" fill="currentColor"/>
      <rect x="1" y="11.5" width="14" height="2.5" rx="0.5" fill="currentColor"/>
    </svg>
  );
}

function ColumnsViewIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5">
      <rect x="1" y="1" width="4" height="14" rx="1" fill="currentColor"/>
      <rect x="6" y="1" width="4" height="14" rx="1" fill="currentColor"/>
      <rect x="11" y="1" width="4" height="14" rx="1" fill="currentColor"/>
    </svg>
  );
}

function GalleryViewIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5">
      <rect x="1" y="1" width="14" height="10" rx="1.5" fill="currentColor"/>
      <rect x="2" y="13" width="3" height="2" rx="0.5" fill="currentColor"/>
      <rect x="6.5" y="13" width="3" height="2" rx="0.5" fill="currentColor"/>
      <rect x="11" y="13" width="3" height="2" rx="0.5" fill="currentColor"/>
    </svg>
  );
}

// Sidebar Icon Component
function SidebarIcon({ type, active }: { type: string; active?: boolean }) {
  const color = active ? '#fff' : '#007AFF';

  const iconMap: Record<string, React.ReactNode> = {
    airdrop: (
      <svg viewBox="0 0 18 18" className="w-[18px] h-[18px]" style={{ color }}>
        <circle cx="9" cy="9" r="2" fill="currentColor"/>
        <path d="M9 4a5 5 0 015 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M9 4a5 5 0 00-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M9 1a8 8 0 018 8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M9 1a8 8 0 00-8 8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    clock: (
      <svg viewBox="0 0 18 18" className="w-[18px] h-[18px]" style={{ color }}>
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M9 5v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    apps: (
      <svg viewBox="0 0 18 18" className="w-[18px] h-[18px]" style={{ color }}>
        <rect x="2" y="2" width="5" height="5" rx="1.5" fill="currentColor"/>
        <rect x="11" y="2" width="5" height="5" rx="1.5" fill="currentColor"/>
        <rect x="2" y="11" width="5" height="5" rx="1.5" fill="currentColor"/>
        <rect x="11" y="11" width="5" height="5" rx="1.5" fill="currentColor"/>
      </svg>
    ),
    desktop: (
      <svg viewBox="0 0 18 18" className="w-[18px] h-[18px]" style={{ color }}>
        <rect x="2" y="3" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M6 15h6M9 12v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    documents: (
      <svg viewBox="0 0 18 18" className="w-[18px] h-[18px]" style={{ color }}>
        <path d="M4 2h6l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M10 2v4h4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
      </svg>
    ),
    downloads: (
      <svg viewBox="0 0 18 18" className="w-[18px] h-[18px]" style={{ color }}>
        <path d="M9 2v10M5 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 14v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    cloud: (
      <svg viewBox="0 0 18 18" className="w-[18px] h-[18px]" style={{ color }}>
        <path d="M4 12a3 3 0 01-.5-5.96A5 5 0 0113 5.5 4 4 0 1114 13H4z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      </svg>
    ),
    hdd: (
      <svg viewBox="0 0 18 18" className="w-[18px] h-[18px]" style={{ color }}>
        <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <circle cx="13" cy="9" r="1.5" fill="currentColor"/>
        <line x1="4" y1="9" x2="8" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  };

  return iconMap[type] || (
    <svg viewBox="0 0 18 18" className="w-[18px] h-[18px]" style={{ color }}>
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  );
}

// Toolbar Button Component
function ToolbarButton({
  children,
  onClick,
  disabled,
  active,
  tooltip
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  tooltip?: string;
}) {
  return (
    <button
      className={`rounded-lg transition-all ${
        active
          ? 'bg-white/20 text-white'
          : disabled
            ? 'text-white/20 cursor-not-allowed'
            : 'text-white/60 hover:bg-white/10 hover:text-white/80'
      }`}
      style={{ padding: '6px' }}
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
    >
      {children}
    </button>
  );
}

// View Mode Button Component
function ViewModeButton({
  children,
  active,
  onClick,
  tooltip
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  tooltip?: string;
}) {
  return (
    <button
      className={`rounded-md transition-all ${
        active
          ? 'bg-white/20 text-white'
          : 'text-white/50 hover:text-white/70'
      }`}
      style={{ padding: '5px' }}
      onClick={onClick}
      title={tooltip}
    >
      {children}
    </button>
  );
}

// Folder Icon Component - Beautiful macOS style
function FolderIcon({ size = 64, color = '#007AFF' }: { size?: number; color?: string }) {
  const id = `folder-${color.replace('#', '')}-${size}`;
  return (
    <svg viewBox="0 0 64 64" style={{ width: size, height: size }}>
      <defs>
        <linearGradient id={`${id}-back`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.7"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.5"/>
        </linearGradient>
        <linearGradient id={`${id}-front`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color}/>
          <stop offset="100%" stopColor={color} stopOpacity="0.8"/>
        </linearGradient>
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
        </filter>
      </defs>
      {/* Back of folder */}
      <path
        d="M8 18h18l4 5h26a3 3 0 013 3v26a3 3 0 01-3 3H8a3 3 0 01-3-3V21a3 3 0 013-3z"
        fill={`url(#${id}-back)`}
      />
      {/* Front of folder */}
      <path
        d="M8 26h48a3 3 0 013 3v23a3 3 0 01-3 3H8a3 3 0 01-3-3V29a3 3 0 013-3z"
        fill={`url(#${id}-front)`}
        filter={`url(#${id}-shadow)`}
      />
      {/* Highlight */}
      <path
        d="M8 26h48a3 3 0 013 3v3H5v-3a3 3 0 013-3z"
        fill="white"
        opacity="0.25"
      />
    </svg>
  );
}

// App Icon Component
function AppIcon({ appId, size = 64 }: { appId: string; size?: number }) {
  const app = appIcons[appId];
  if (!app) {
    return (
      <svg viewBox="0 0 64 64" style={{ width: size, height: size }}>
        <defs>
          <linearGradient id="default-app" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8E8E93"/>
            <stop offset="100%" stopColor="#636366"/>
          </linearGradient>
        </defs>
        <rect x="8" y="8" width="48" height="48" rx="12" fill="url(#default-app)"/>
      </svg>
    );
  }

  const gradientId = `app-${appId}-${size}`;
  const isMultiColor = app.gradient.length > 2;

  return (
    <svg viewBox="0 0 64 64" style={{ width: size, height: size }}>
      <defs>
        {isMultiColor ? (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            {app.gradient.map((color, i) => (
              <stop key={i} offset={`${(i / (app.gradient.length - 1)) * 100}%`} stopColor={color}/>
            ))}
          </linearGradient>
        ) : (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={app.gradient[0]}/>
            <stop offset="100%" stopColor={app.gradient[1]}/>
          </linearGradient>
        )}
        <filter id={`${gradientId}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.3"/>
        </filter>
      </defs>
      <rect x="8" y="8" width="48" height="48" rx="12" fill={`url(#${gradientId})`} filter={`url(#${gradientId}-shadow)`}/>
      <g transform="translate(16, 16)">{app.icon}</g>
    </svg>
  );
}

// File Icon Component
function FileIcon({ extension, size = 64 }: { extension?: string; size?: number }) {
  const fileInfo = getFileIcon(extension);
  const gradientId = `file-${extension || 'default'}-${size}`;

  if (fileInfo.isImage) {
    return (
      <svg viewBox="0 0 64 64" style={{ width: size, height: size }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={fileInfo.color}/>
            <stop offset="100%" stopColor={fileInfo.color} stopOpacity="0.7"/>
          </linearGradient>
        </defs>
        <rect x="8" y="8" width="48" height="48" rx="4" fill={`url(#${gradientId})`}/>
        <circle cx="20" cy="22" r="5" fill="white" opacity="0.6"/>
        <path d="M10 42l12-14 8 10 6-5 18 15H10z" fill="white" opacity="0.5"/>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" style={{ width: size, height: size }}>
      <defs>
        <linearGradient id={`${gradientId}-doc`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F5F5F7"/>
          <stop offset="100%" stopColor="#E5E5EA"/>
        </linearGradient>
        <filter id={`${gradientId}-shadow`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.15"/>
        </filter>
      </defs>
      {/* Document body */}
      <path
        d="M14 4h24l12 12v44a4 4 0 01-4 4H14a4 4 0 01-4-4V8a4 4 0 014-4z"
        fill={`url(#${gradientId}-doc)`}
        filter={`url(#${gradientId}-shadow)`}
      />
      {/* Fold corner */}
      <path d="M38 4v12h12" fill="#D1D1D6"/>
      <path d="M38 4l12 12H42a4 4 0 01-4-4V4z" fill="#EBEBF0"/>
      {/* Extension label */}
      <rect x="10" y="42" width="44" height="18" rx="2" fill={fileInfo.color}/>
      <text
        x="32"
        y="55"
        fill="white"
        fontSize="11"
        fontWeight="600"
        textAnchor="middle"
        fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
      >
        {fileInfo.label}
      </text>
    </svg>
  );
}

// Icons View
function IconsView({
  files,
  selectedFile,
  onSelect,
  onDoubleClick
}: {
  files: FileItem[];
  selectedFile: string | null;
  onSelect: (id: string) => void;
  onDoubleClick: (file: FileItem) => void;
}) {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}
    >
      {files.map((file) => (
        <motion.div
          key={file.id}
          className={`flex flex-col items-center gap-2 rounded-xl cursor-pointer ${
            selectedFile === file.id ? 'bg-white/10' : 'hover:bg-white/5'
          }`}
          style={{ padding: '12px' }}
          onClick={() => onSelect(file.id)}
          onDoubleClick={() => onDoubleClick(file)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {file.type === 'folder' ? (
            <FolderIcon size={64} color={file.color || '#007AFF'} />
          ) : file.type === 'app' ? (
            <AppIcon appId={file.appId || ''} size={64} />
          ) : (
            <FileIcon extension={file.extension} size={64} />
          )}
          <span
            className={`text-[11px] text-center leading-tight w-full rounded-md ${
              selectedFile === file.id ? 'bg-[#007AFF] text-white' : 'text-white/80'
            }`}
            style={{
              padding: '3px 6px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {file.name}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// List View
function ListView({
  files,
  selectedFile,
  onSelect,
  onDoubleClick,
}: {
  files: FileItem[];
  selectedFile: string | null;
  onSelect: (id: string) => void;
  onDoubleClick: (file: FileItem) => void;
}) {
  return (
    <div>
      {/* Header */}
      <div
        className="flex items-center gap-4 text-[11px] text-white/40 font-medium border-b border-white/10"
        style={{ padding: '8px 16px' }}
      >
        <span className="w-6" />
        <span className="flex-1">Nom</span>
        <span className="w-32">Date de modification</span>
        <span className="w-20 text-right">Taille</span>
      </div>
      <div style={{ padding: '4px 0' }}>
        {files.map((file) => (
          <motion.div
            key={file.id}
            className={`flex items-center gap-4 rounded-lg cursor-pointer ${
              selectedFile === file.id ? 'bg-[#007AFF]' : 'hover:bg-white/5'
            }`}
            style={{ padding: '8px 16px' }}
            onClick={() => onSelect(file.id)}
            onDoubleClick={() => onDoubleClick(file)}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              {file.type === 'folder' ? (
                <FolderIcon size={24} color={file.color || '#007AFF'} />
              ) : file.type === 'app' ? (
                <AppIcon appId={file.appId || ''} size={24} />
              ) : (
                <FileIcon extension={file.extension} size={24} />
              )}
            </div>
            <span className={`flex-1 text-[13px] truncate ${selectedFile === file.id ? 'text-white' : 'text-white/80'}`}>
              {file.name}
            </span>
            <span className={`w-32 text-[12px] ${selectedFile === file.id ? 'text-white/70' : 'text-white/40'}`}>
              {file.modified}
            </span>
            <span className={`w-20 text-[12px] text-right ${selectedFile === file.id ? 'text-white/70' : 'text-white/40'}`}>
              {file.size}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Columns View
function ColumnsView({
  files,
  selectedFile,
  onSelect,
  onDoubleClick,
}: {
  files: FileItem[];
  selectedFile: string | null;
  onSelect: (id: string) => void;
  onDoubleClick: (file: FileItem) => void;
}) {
  const selectedFileData = files.find(f => f.id === selectedFile);

  return (
    <div className="flex h-full">
      <div className="w-72 border-r border-white/10 overflow-auto">
        <div style={{ padding: '8px' }}>
          {files.map((file) => (
            <motion.div
              key={file.id}
              className={`flex items-center gap-3 rounded-lg cursor-pointer ${
                selectedFile === file.id ? 'bg-[#007AFF]' : 'hover:bg-white/5'
              }`}
              style={{ padding: '8px 12px', marginBottom: '2px' }}
              onClick={() => onSelect(file.id)}
              onDoubleClick={() => onDoubleClick(file)}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {file.type === 'folder' ? (
                  <FolderIcon size={20} color={file.color || '#007AFF'} />
                ) : file.type === 'app' ? (
                  <AppIcon appId={file.appId || ''} size={20} />
                ) : (
                  <FileIcon extension={file.extension} size={20} />
                )}
              </div>
              <span className={`flex-1 text-[13px] truncate ${selectedFile === file.id ? 'text-white' : 'text-white/80'}`}>
                {file.name}
              </span>
              {file.type === 'folder' && (
                <svg viewBox="0 0 16 16" className={`w-3 h-3 ${selectedFile === file.id ? 'text-white/60' : 'text-white/30'}`}>
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      {selectedFileData && (
        <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: '24px' }}>
          {selectedFileData.type === 'folder' ? (
            <FolderIcon size={160} color={selectedFileData.color || '#007AFF'} />
          ) : selectedFileData.type === 'app' ? (
            <AppIcon appId={selectedFileData.appId || ''} size={160} />
          ) : (
            <FileIcon extension={selectedFileData.extension} size={160} />
          )}
          <span className="text-white text-[16px] font-medium" style={{ marginTop: '16px' }}>{selectedFileData.name}</span>
          <span className="text-white/40 text-[12px]" style={{ marginTop: '4px' }}>{selectedFileData.modified}</span>
        </div>
      )}
    </div>
  );
}

// Gallery View
function GalleryView({
  files,
  selectedFile,
  onSelect,
  onDoubleClick
}: {
  files: FileItem[];
  selectedFile: string | null;
  onSelect: (id: string) => void;
  onDoubleClick: (file: FileItem) => void;
}) {
  const selectedFileData = files.find(f => f.id === selectedFile);

  return (
    <div className="flex flex-col h-full">
      {/* Large preview */}
      <div className="flex-1 flex items-center justify-center" style={{ padding: '32px' }}>
        {selectedFileData ? (
          <motion.div
            key={selectedFileData.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            {selectedFileData.type === 'folder' ? (
              <FolderIcon size={200} color={selectedFileData.color || '#007AFF'} />
            ) : selectedFileData.type === 'app' ? (
              <AppIcon appId={selectedFileData.appId || ''} size={200} />
            ) : (
              <FileIcon extension={selectedFileData.extension} size={200} />
            )}
            <span className="text-white text-[16px] font-medium" style={{ marginTop: '20px' }}>{selectedFileData.name}</span>
          </motion.div>
        ) : (
          <span className="text-white/30 text-[14px]">Selectionnez un element</span>
        )}
      </div>

      {/* Thumbnails */}
      <div
        className="border-t border-white/10 flex items-center gap-3 overflow-x-auto"
        style={{ padding: '16px 20px', height: '100px' }}
      >
        {files.map((file) => (
          <motion.div
            key={file.id}
            className={`flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-xl cursor-pointer ${
              selectedFile === file.id ? 'bg-white/10 ring-2 ring-[#007AFF]' : 'hover:bg-white/5'
            }`}
            onClick={() => onSelect(file.id)}
            onDoubleClick={() => onDoubleClick(file)}
            whileHover={{ scale: 1.05 }}
          >
            {file.type === 'folder' ? (
              <FolderIcon size={44} color={file.color || '#007AFF'} />
            ) : file.type === 'app' ? (
              <AppIcon appId={file.appId || ''} size={44} />
            ) : (
              <FileIcon extension={file.extension} size={44} />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Preview Panel
function PreviewPanel({ file }: { file?: FileItem }) {
  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/30" style={{ padding: '24px' }}>
        <svg viewBox="0 0 64 64" className="w-16 h-16 opacity-40" style={{ marginBottom: '12px' }}>
          <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M32 20v24M20 32h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span className="text-[13px] text-center leading-relaxed">
          Selectionnez un element<br/>pour voir ses informations
        </span>
      </div>
    );
  }

  const typeLabel = file.type === 'folder'
    ? 'Dossier'
    : file.type === 'app'
      ? 'Application'
      : file.extension?.toUpperCase() || 'Document';

  return (
    <div className="h-full flex flex-col" style={{ padding: '24px' }}>
      {/* Icon */}
      <div className="flex justify-center" style={{ paddingBottom: '24px' }}>
        {file.type === 'folder' ? (
          <FolderIcon size={120} color={file.color || '#007AFF'} />
        ) : file.type === 'app' ? (
          <AppIcon appId={file.appId || ''} size={120} />
        ) : (
          <FileIcon extension={file.extension} size={120} />
        )}
      </div>

      {/* Name */}
      <div className="text-center" style={{ marginBottom: '20px' }}>
        <div className="text-white text-[15px] font-medium break-words">{file.name}</div>
        <div className="text-white/40 text-[12px]" style={{ marginTop: '4px' }}>
          {typeLabel}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10" style={{ margin: '8px 0' }} />

      {/* Info */}
      <div style={{ marginTop: '8px' }}>
        <div className="flex justify-between" style={{ marginBottom: '12px' }}>
          <span className="text-white/40 text-[12px]">Modifie</span>
          <span className="text-white/80 text-[12px]">{file.modified}</span>
        </div>
        <div className="flex justify-between" style={{ marginBottom: '12px' }}>
          <span className="text-white/40 text-[12px]">Taille</span>
          <span className="text-white/80 text-[12px]">{file.size}</span>
        </div>
        {file.type === 'file' && file.extension && (
          <div className="flex justify-between">
            <span className="text-white/40 text-[12px]">Type</span>
            <span className="text-white/80 text-[12px]">.{file.extension}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {file.tags && file.tags.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <div className="text-white/40 text-[11px] font-medium uppercase" style={{ marginBottom: '8px' }}>Tags</div>
          <div className="flex flex-wrap gap-2">
            {file.tags.map(tag => (
              <span
                key={tag}
                className="text-[11px] text-white/70 bg-white/10 rounded-full"
                style={{ padding: '3px 10px' }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add tag button */}
      <div style={{ marginTop: '16px' }}>
        <button className="text-[12px] text-[#007AFF] hover:underline">
          + Ajouter un tag
        </button>
      </div>
    </div>
  );
}
