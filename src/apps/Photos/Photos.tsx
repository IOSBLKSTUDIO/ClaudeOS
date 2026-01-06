import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Photo {
  id: string;
  url: string;
  title: string;
  album: string;
  favorite: boolean;
  date: Date;
}

type ViewMode = 'hero' | 'grid' | 'list';
type Album = 'all' | 'favorites' | 'nature' | 'travel' | 'portraits';

const initialPhotos: Photo[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', title: 'Alpes suisses', album: 'nature', favorite: true, date: new Date('2024-01-15') },
  { id: '2', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800', title: 'Foret enchantee', album: 'nature', favorite: false, date: new Date('2024-01-14') },
  { id: '3', url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800', title: 'Cascade secrete', album: 'nature', favorite: true, date: new Date('2024-01-13') },
  { id: '4', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800', title: 'Lac miroir', album: 'travel', favorite: false, date: new Date('2024-01-12') },
  { id: '5', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800', title: 'Vallee brumeuse', album: 'nature', favorite: false, date: new Date('2024-01-11') },
  { id: '6', url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800', title: 'Chemin forestier', album: 'nature', favorite: false, date: new Date('2024-01-10') },
  { id: '7', url: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800', title: 'Riviere turquoise', album: 'travel', favorite: true, date: new Date('2024-01-09') },
  { id: '8', url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800', title: 'Plage doree', album: 'travel', favorite: false, date: new Date('2024-01-08') },
  { id: '9', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800', title: 'Sommet etoile', album: 'nature', favorite: true, date: new Date('2024-01-07') },
  { id: '10', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', title: 'Portrait voyage', album: 'portraits', favorite: false, date: new Date('2024-01-06') },
  { id: '11', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', title: 'Temple ancien', album: 'travel', favorite: false, date: new Date('2024-01-05') },
  { id: '12', url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800', title: 'Aurore boreale', album: 'nature', favorite: true, date: new Date('2024-01-04') },
];

const albums: { id: Album; name: string; icon: string }[] = [
  { id: 'all', name: 'Toutes', icon: '🖼️' },
  { id: 'favorites', name: 'Favoris', icon: '❤️' },
  { id: 'nature', name: 'Nature', icon: '🌿' },
  { id: 'travel', name: 'Voyages', icon: '✈️' },
  { id: 'portraits', name: 'Portraits', icon: '👤' },
];

export default function Photos() {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('hero');
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter photos
  const filteredPhotos = photos.filter(p => {
    // Filter by album
    const matchesAlbum = selectedAlbum === 'all'
      ? true
      : selectedAlbum === 'favorites'
        ? p.favorite
        : p.album === selectedAlbum;

    // Filter by search
    const matchesSearch = searchQuery === ''
      ? true
      : p.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesAlbum && matchesSearch;
  });

  const mainPhoto = selectedPhoto || filteredPhotos[0];

  // Actions
  const toggleFavorite = (id: string) => {
    setPhotos(photos.map(p => p.id === id ? { ...p, favorite: !p.favorite } : p));
  };

  const deletePhoto = (id: string) => {
    setPhotos(photos.filter(p => p.id !== id));
    if (selectedPhoto?.id === id) setSelectedPhoto(null);
  };

  const moveToAlbum = (id: string, album: string) => {
    setPhotos(photos.map(p => p.id === id ? { ...p, album } : p));
    setShowMoveMenu(false);
  };

  const formatDate = (date: Date) => new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const getAlbumCount = (albumId: Album) => {
    if (albumId === 'all') return photos.length;
    if (albumId === 'favorites') return photos.filter(p => p.favorite).length;
    return photos.filter(p => p.album === albumId).length;
  };

  return (
    <div className="h-full flex bg-[#1c1c1e]">
      {/* Sidebar */}
      <div
        className="w-56 bg-[#2c2c2e] border-r border-white/10 flex flex-col"
        style={{ padding: '16px 0' }}
      >
        {/* App Title */}
        <div style={{ padding: '0 20px', marginBottom: '16px' }}>
          <h1 className="text-white/90 text-lg font-semibold flex items-center gap-2">
            <span className="text-2xl">📷</span> Photos
          </h1>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '0 12px', marginBottom: '16px' }}>
          <div
            className="flex items-center gap-3 bg-white/10 rounded-xl"
            style={{ padding: '10px 14px' }}
          >
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current text-white/40 flex-shrink-0">
              <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm placeholder-white/40 outline-none min-w-0"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-white/40 hover:text-white/60 flex-shrink-0"
              >
                <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Albums List */}
        <div className="flex-1 overflow-auto" style={{ padding: '0 12px' }}>
          {albums.map(album => (
            <button
              key={album.id}
              onClick={() => { setSelectedAlbum(album.id); setSelectedPhoto(null); }}
              className={`w-full flex items-center gap-3 rounded-lg transition-colors ${
                selectedAlbum === album.id
                  ? 'bg-[#3a3a3c] text-white'
                  : 'text-white/70 hover:bg-white/5'
              }`}
              style={{ padding: '10px 12px', marginBottom: '4px' }}
            >
              <span className="text-lg">{album.icon}</span>
              <span className="flex-1 text-left text-sm">{album.name}</span>
              <span className="text-xs text-white/40">{getAlbumCount(album.id)}</span>
            </button>
          ))}
        </div>

        {/* View Mode Switcher */}
        <div style={{ padding: '16px 12px 0' }}>
          <div className="text-white/40 text-xs mb-3 px-2 uppercase tracking-wider">Affichage</div>
          <div className="flex gap-2">
            {[
              { mode: 'hero' as ViewMode, icon: '▣', label: 'Principal' },
              { mode: 'grid' as ViewMode, icon: '▦', label: 'Grille' },
              { mode: 'list' as ViewMode, icon: '☰', label: 'Liste' },
            ].map(v => (
              <button
                key={v.mode}
                onClick={() => setViewMode(v.mode)}
                className={`flex-1 rounded-lg text-sm transition-colors ${
                  viewMode === v.mode
                    ? 'bg-[#0a84ff] text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
                style={{ padding: '10px 8px' }}
                title={v.label}
              >
                {v.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-[#1c1c1e]">
        {/* Toolbar */}
        {mainPhoto && (
          <div
            className="border-b border-white/10 flex items-center justify-between"
            style={{ padding: '12px 24px' }}
          >
            <div className="flex items-center gap-4">
              <span className="text-white font-medium">{mainPhoto.title}</span>
              <span className="text-white/30">|</span>
              <span className="text-white/40 text-sm">{formatDate(mainPhoto.date)}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Favorite */}
              <button
                onClick={() => toggleFavorite(mainPhoto.id)}
                className={`p-2 rounded-lg transition-colors ${
                  mainPhoto.favorite ? 'text-red-500 bg-red-500/10' : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title="Favoris"
              >
                <svg className="w-5 h-5" fill={mainPhoto.favorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>

              {/* Move to album */}
              <div className="relative">
                <button
                  onClick={() => setShowMoveMenu(!showMoveMenu)}
                  className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  title="Deplacer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </button>

                {showMoveMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMoveMenu(false)} />
                    <div
                      className="absolute right-0 top-full mt-2 bg-[#3a3a3c] rounded-xl border border-white/10 overflow-hidden z-20"
                      style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.4)', minWidth: '180px' }}
                    >
                      {albums.filter(a => a.id !== 'all' && a.id !== 'favorites').map(album => (
                        <button
                          key={album.id}
                          onClick={() => moveToAlbum(mainPhoto.id, album.id)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                            mainPhoto.album === album.id ? 'bg-[#0a84ff] text-white' : 'text-white/80 hover:bg-white/10'
                          }`}
                        >
                          <span>{album.icon}</span>
                          <span>{album.name}</span>
                          {mainPhoto.album === album.id && (
                            <svg viewBox="0 0 20 20" className="w-4 h-4 ml-auto text-white" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Delete */}
              <button
                onClick={() => deletePhoto(mainPhoto.id)}
                className="p-2 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                title="Supprimer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {filteredPhotos.length === 0 ? (
            <div className="h-full flex items-center justify-center text-white/40">
              <div className="text-center" style={{ padding: '40px' }}>
                <div className="text-6xl mb-4">{searchQuery ? '🔍' : '📷'}</div>
                <div className="text-xl mb-2">
                  {searchQuery ? 'Aucun resultat' : 'Aucune photo'}
                </div>
                <div className="text-sm text-white/30">
                  {searchQuery
                    ? `Aucune photo ne correspond a "${searchQuery}"`
                    : 'Selectionnez un album avec des photos'
                  }
                </div>
              </div>
            </div>
          ) : viewMode === 'hero' ? (
            /* Hero View - Main + Thumbnails */
            <div className="h-full flex flex-col" style={{ padding: '20px 24px' }}>
              {/* Main Photo */}
              <div className="flex-1 flex items-center justify-center bg-black/40 rounded-2xl overflow-hidden" style={{ marginBottom: '16px' }}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={mainPhoto?.id}
                    src={mainPhoto?.url.replace('w=800', 'w=1400')}
                    alt={mainPhoto?.title}
                    className="max-w-full max-h-full object-contain"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </AnimatePresence>
              </div>

              {/* Thumbnails Strip */}
              <div className="flex gap-3 overflow-x-auto" style={{ height: '80px', paddingBottom: '4px' }}>
                {filteredPhotos.map(photo => (
                  <motion.button
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className={`relative flex-shrink-0 h-full aspect-[4/3] rounded-xl overflow-hidden transition-all ${
                      mainPhoto?.id === photo.id
                        ? 'ring-2 ring-[#0a84ff] ring-offset-2 ring-offset-[#1c1c1e]'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    {photo.favorite && (
                      <div className="absolute top-1.5 right-1.5 text-xs">❤️</div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="h-full overflow-auto" style={{ padding: '20px 24px' }}>
              <div className="grid grid-cols-4 gap-4">
                {filteredPhotos.map(photo => (
                  <motion.div
                    key={photo.id}
                    className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer group ${
                      mainPhoto?.id === photo.id ? 'ring-2 ring-[#0a84ff]' : ''
                    }`}
                    onClick={() => setSelectedPhoto(photo)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {photo.favorite && (
                      <div className="absolute top-3 right-3 text-sm">❤️</div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm font-medium truncate">{photo.title}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            /* List View */
            <div className="h-full overflow-auto" style={{ padding: '8px 0' }}>
              {filteredPhotos.map(photo => (
                <motion.div
                  key={photo.id}
                  className={`flex items-center border-b border-white/5 cursor-pointer transition-colors ${
                    mainPhoto?.id === photo.id ? 'bg-[#0a84ff]/20' : 'hover:bg-white/5'
                  }`}
                  style={{ padding: '16px 24px', gap: '16px' }}
                  onClick={() => setSelectedPhoto(photo)}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium truncate">{photo.title}</span>
                      {photo.favorite && <span className="text-sm">❤️</span>}
                    </div>
                    <div className="text-white/40 text-sm mt-1">{formatDate(photo.date)}</div>
                    <div className="text-white/30 text-xs mt-2">
                      {albums.find(a => a.id === photo.album)?.icon} {albums.find(a => a.id === photo.album)?.name}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(photo.id); }}
                      className={`p-2 rounded-lg transition-colors ${
                        photo.favorite ? 'text-red-500' : 'text-white/30 hover:text-white/60'
                      }`}
                    >
                      <svg className="w-5 h-5" fill={photo.favorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deletePhoto(photo.id); }}
                      className="p-2 rounded-lg text-white/30 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div
          className="border-t border-white/10 flex items-center justify-between text-xs text-white/40"
          style={{ padding: '10px 24px' }}
        >
          <span>{filteredPhotos.length} photo{filteredPhotos.length !== 1 ? 's' : ''}</span>
          <span>{photos.filter(p => p.favorite).length} favori{photos.filter(p => p.favorite).length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}
