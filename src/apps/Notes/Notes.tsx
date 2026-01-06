import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Note {
  id: string;
  title: string;
  content: string;
  folder: string;
  color: string;
  pinned: boolean;
  createdAt: Date;
  modifiedAt: Date;
}

interface Folder {
  id: string;
  name: string;
  icon: string;
}

const defaultFolders: Folder[] = [
  { id: 'all', name: 'Toutes les notes', icon: '📋' },
  { id: 'personal', name: 'Personnel', icon: '👤' },
  { id: 'work', name: 'Travail', icon: '💼' },
  { id: 'ideas', name: 'Idees', icon: '💡' },
  { id: 'archive', name: 'Archives', icon: '📦' },
];

const noteColors = [
  { id: 'default', color: 'transparent', name: 'Par defaut' },
  { id: 'yellow', color: '#fef3c7', name: 'Jaune' },
  { id: 'green', color: '#d1fae5', name: 'Vert' },
  { id: 'blue', color: '#dbeafe', name: 'Bleu' },
  { id: 'purple', color: '#ede9fe', name: 'Violet' },
  { id: 'pink', color: '#fce7f3', name: 'Rose' },
];

const initialNotes: Note[] = [
  {
    id: '1',
    title: 'Bienvenue sur ClaudeOS',
    content: 'Ceci est un systeme d\'exploitation style macOS construit avec React et TypeScript.\n\nFonctionnalites:\n• Gestion des fenetres\n• Dock avec effet de loupe\n• Applications multiples\n• Recherche Spotlight\n\nBonne exploration !',
    folder: 'personal',
    color: 'transparent',
    pinned: true,
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
  {
    id: '2',
    title: 'Astuces rapides',
    content: '• Cmd+Space pour ouvrir Spotlight\n• Double-clic sur les icones du dock\n• Glissez les fenetres par la barre de titre\n• Redimensionnez depuis les coins',
    folder: 'personal',
    color: 'transparent',
    pinned: false,
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
];

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('claudeos-notes-v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((n: Note) => ({
        ...n,
        folder: n.folder || 'personal',
        color: n.color || 'transparent',
        pinned: n.pinned || false,
      }));
    }
    return initialNotes;
  });
  const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0] || null);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('claudeos-notes-v2', JSON.stringify(notes));
  }, [notes]);

  // Filter notes
  const filteredNotes = notes
    .filter((note) => {
      const matchesFolder = selectedFolder === 'all' || note.folder === selectedFolder;
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFolder && matchesSearch;
    })
    .sort((a, b) => {
      // Pinned notes first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      // Then by date
      return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
    });

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: '',
      content: '',
      folder: selectedFolder === 'all' ? 'personal' : selectedFolder,
      color: 'transparent',
      pinned: false,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(
      notes.map((note) =>
        note.id === id
          ? { ...note, ...updates, modifiedAt: new Date() }
          : note
      )
    );
    if (selectedNote?.id === id) {
      setSelectedNote({ ...selectedNote, ...updates, modifiedAt: new Date() });
    }
  };

  const deleteNote = (id: string) => {
    const noteIndex = notes.findIndex(n => n.id === id);
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);

    if (selectedNote?.id === id) {
      // Select next or previous note
      const nextNote = newNotes[noteIndex] || newNotes[noteIndex - 1] || null;
      setSelectedNote(nextNote);
    }
  };

  const togglePin = (id: string) => {
    updateNote(id, { pinned: !notes.find(n => n.id === id)?.pinned });
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return d.toLocaleDateString('fr-FR', { weekday: 'long' });
    }
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const getNotePreview = (content: string) => {
    const lines = content.split('\n').filter(l => l.trim());
    return lines.slice(0, 2).join(' ').substring(0, 100) || 'Aucun texte';
  };

  const getNotesCount = (folderId: string) => {
    if (folderId === 'all') return notes.length;
    return notes.filter(n => n.folder === folderId).length;
  };

  return (
    <div className="flex h-full bg-[#1c1c1e]">
      {/* Sidebar - Folders */}
      <div
        className="w-56 bg-[#2c2c2e] border-r border-white/10 flex flex-col"
        style={{ padding: '16px 0' }}
      >
        {/* App Title */}
        <div style={{ padding: '0 20px', marginBottom: '20px' }}>
          <h1 className="text-white/90 text-lg font-semibold flex items-center gap-2">
            <span className="text-2xl">📝</span> Notes
          </h1>
        </div>

        {/* Folders List */}
        <div className="flex-1 overflow-auto" style={{ padding: '0 12px' }}>
          {defaultFolders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={`w-full flex items-center gap-3 rounded-lg transition-colors ${
                selectedFolder === folder.id
                  ? 'bg-[#3a3a3c] text-white'
                  : 'text-white/70 hover:bg-white/5'
              }`}
              style={{ padding: '10px 12px', marginBottom: '4px' }}
            >
              <span className="text-lg">{folder.icon}</span>
              <span className="flex-1 text-left text-sm">{folder.name}</span>
              <span className="text-xs text-white/40">{getNotesCount(folder.id)}</span>
            </button>
          ))}
        </div>

        {/* New Note Button */}
        <div style={{ padding: '16px 12px 0' }}>
          <button
            className="w-full flex items-center justify-center gap-2 bg-[#0a84ff] hover:bg-[#0077ed] text-white text-sm font-medium rounded-xl transition-colors"
            style={{ padding: '12px 16px' }}
            onClick={createNote}
          >
            <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor">
              <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
            </svg>
            Nouvelle note
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div
        className="w-72 bg-[#252528] border-r border-white/10 flex flex-col"
      >
        {/* Search */}
        <div style={{ padding: '16px' }}>
          <div
            className="flex items-center gap-3 bg-white/10 rounded-xl"
            style={{ padding: '10px 14px' }}
          >
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current text-white/40">
              <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm placeholder-white/40 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-white/40 hover:text-white/60"
              >
                <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Notes Count */}
        <div
          className="text-white/40 text-xs font-medium uppercase tracking-wider border-b border-white/10"
          style={{ padding: '0 20px 12px' }}
        >
          {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-auto" style={{ padding: '8px' }}>
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`rounded-xl cursor-pointer transition-colors ${
                  selectedNote?.id === note.id
                    ? 'bg-[#0a84ff]'
                    : 'hover:bg-white/5'
                }`}
                style={{
                  padding: '14px 16px',
                  marginBottom: '6px',
                  backgroundColor: selectedNote?.id !== note.id && note.color !== 'transparent'
                    ? note.color
                    : undefined,
                }}
                onClick={() => setSelectedNote(note)}
              >
                <div className="flex items-start gap-2">
                  {note.pinned && (
                    <span className="text-xs mt-0.5">📌</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-medium text-sm truncate ${
                        selectedNote?.id === note.id ? 'text-white' :
                        note.color !== 'transparent' ? 'text-gray-800' : 'text-white'
                      }`}
                    >
                      {note.title || 'Sans titre'}
                    </div>
                    <div
                      className={`text-xs mt-1 ${
                        selectedNote?.id === note.id ? 'text-white/70' :
                        note.color !== 'transparent' ? 'text-gray-600' : 'text-white/50'
                      }`}
                    >
                      {formatDate(note.modifiedAt)}
                    </div>
                    <div
                      className={`text-xs mt-2 line-clamp-2 ${
                        selectedNote?.id === note.id ? 'text-white/60' :
                        note.color !== 'transparent' ? 'text-gray-500' : 'text-white/40'
                      }`}
                    >
                      {getNotePreview(note.content)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredNotes.length === 0 && (
            <div className="flex flex-col items-center justify-center text-white/40 text-sm" style={{ padding: '40px 20px' }}>
              <span className="text-4xl mb-3">🔍</span>
              <span>Aucune note trouvee</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Editor */}
      <div className="flex-1 flex flex-col bg-[#1c1c1e]">
        {selectedNote ? (
          <>
            {/* Toolbar */}
            <div
              className="border-b border-white/10 flex items-center justify-between"
              style={{ padding: '12px 24px' }}
            >
              <div className="flex items-center gap-4">
                {/* Folder selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowFolderPicker(!showFolderPicker)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors"
                  >
                    <span>{defaultFolders.find(f => f.id === selectedNote.folder)?.icon}</span>
                    <span>{defaultFolders.find(f => f.id === selectedNote.folder)?.name}</span>
                    <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {showFolderPicker && (
                    <div
                      className="absolute top-full left-0 mt-2 bg-[#3a3a3c] rounded-xl border border-white/10 overflow-hidden z-10"
                      style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.4)', minWidth: '180px' }}
                    >
                      {defaultFolders.filter(f => f.id !== 'all').map((folder) => (
                        <button
                          key={folder.id}
                          onClick={() => {
                            updateNote(selectedNote.id, { folder: folder.id });
                            setShowFolderPicker(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-white/80 hover:bg-white/10 transition-colors text-sm"
                        >
                          <span>{folder.icon}</span>
                          <span>{folder.name}</span>
                          {selectedNote.folder === folder.id && (
                            <svg viewBox="0 0 20 20" className="w-4 h-4 ml-auto text-[#0a84ff]" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-white/30">|</span>

                <span className="text-xs text-white/40">
                  Modifie {formatDate(selectedNote.modifiedAt)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Color picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                    title="Couleur"
                  >
                    <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {showColorPicker && (
                    <div
                      className="absolute top-full right-0 mt-2 bg-[#3a3a3c] rounded-xl border border-white/10 p-3 z-10"
                      style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.4)' }}
                    >
                      <div className="flex gap-2">
                        {noteColors.map((color) => (
                          <button
                            key={color.id}
                            onClick={() => {
                              updateNote(selectedNote.id, { color: color.color });
                              setShowColorPicker(false);
                            }}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                              selectedNote.color === color.color ? 'border-[#0a84ff]' : 'border-white/20'
                            }`}
                            style={{ backgroundColor: color.color === 'transparent' ? '#3a3a3c' : color.color }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Pin button */}
                <button
                  className={`p-2 hover:bg-white/10 rounded-lg transition-colors ${
                    selectedNote.pinned ? 'text-[#0a84ff]' : 'text-white/60 hover:text-white'
                  }`}
                  onClick={() => togglePin(selectedNote.id)}
                  title={selectedNote.pinned ? 'Desepingler' : 'Epingler'}
                >
                  <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </button>

                {/* Delete button */}
                <button
                  className="p-2 hover:bg-red-500/20 rounded-lg text-white/60 hover:text-red-400 transition-colors"
                  onClick={() => deleteNote(selectedNote.id)}
                  title="Supprimer"
                >
                  <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Editor */}
            <div
              className="flex-1 overflow-auto"
              style={{ padding: '24px 32px' }}
            >
              {/* Title */}
              <input
                type="text"
                value={selectedNote.title}
                onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                placeholder="Titre de la note"
                className="w-full bg-transparent text-white text-2xl font-semibold outline-none placeholder-white/30"
                style={{ marginBottom: '20px' }}
              />

              {/* Content */}
              <textarea
                value={selectedNote.content}
                onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
                placeholder="Commencez a ecrire..."
                className="w-full h-full bg-transparent text-white/80 text-base outline-none resize-none leading-relaxed placeholder-white/30"
                style={{ minHeight: '300px' }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/40">
            <div className="text-center" style={{ padding: '40px' }}>
              <div className="text-6xl mb-4">📝</div>
              <div className="text-xl mb-2">Aucune note selectionnee</div>
              <div className="text-sm text-white/30">Selectionnez une note ou creez-en une nouvelle</div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(showColorPicker || showFolderPicker) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowColorPicker(false);
            setShowFolderPicker(false);
          }}
        />
      )}
    </div>
  );
}
