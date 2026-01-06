import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  artwork: string;
  gradient: string;
  audioUrl: string;
}

// Free audio samples that work with CORS
const demoTracks: Track[] = [
  {
    id: '1',
    title: 'Retro Soul',
    artist: 'Audionautix',
    duration: 149,
    artwork: '🎷',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: '2',
    title: 'Electronic Vibes',
    artist: 'SoundHelix',
    duration: 310,
    artwork: '🎹',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: '3',
    title: 'Ambient Dreams',
    artist: 'SoundHelix',
    duration: 232,
    artwork: '🌙',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: '4',
    title: 'Sunny Afternoon',
    artist: 'SoundHelix',
    duration: 280,
    artwork: '☀️',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    id: '5',
    title: 'Chill Beats',
    artist: 'SoundHelix',
    duration: 267,
    artwork: '🎧',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  },
  {
    id: '6',
    title: 'Rock Energy',
    artist: 'SoundHelix',
    duration: 318,
    artwork: '🎸',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  },
];

const playlists = [
  { id: 'all', name: 'Toute la musique', icon: '🎵' },
  { id: 'favorites', name: 'Favoris', icon: '❤️' },
  { id: 'recent', name: 'Recents', icon: '🕐' },
];

// Album artwork component
function AlbumArt({ track, size = 'md' }: { track: Track | null; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { width: '44px', height: '44px', fontSize: '20px', radius: '10px' },
    md: { width: '56px', height: '56px', fontSize: '26px', radius: '12px' },
    lg: { width: '200px', height: '200px', fontSize: '80px', radius: '16px' },
  };
  const s = sizes[size];

  if (!track) {
    return (
      <div
        className="bg-white/10 flex items-center justify-center flex-shrink-0"
        style={{ width: s.width, height: s.height, borderRadius: s.radius }}
      >
        <span style={{ fontSize: s.fontSize }} className="opacity-30">🎵</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center flex-shrink-0 shadow-lg"
      style={{ width: s.width, height: s.height, borderRadius: s.radius, background: track.gradient }}
    >
      <span style={{ fontSize: s.fontSize }}>{track.artwork}</span>
    </div>
  );
}

export default function Music() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [selectedPlaylist, setSelectedPlaylist] = useState('all');
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handleEnded = () => {
      if (repeat === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        handleNext();
      }
    };
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      console.error('Erreur audio');
      setIsLoading(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playTrack = useCallback(async (track: Track) => {
    if (!audioRef.current) return;
    setIsLoading(true);
    setCurrentTrack(track);
    setProgress(0);

    try {
      audioRef.current.src = track.audioUrl;
      audioRef.current.load();
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Erreur lecture:', error);
      setIsLoading(false);
    }
  }, []);

  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return;

    if (!currentTrack) {
      playTrack(demoTracks[0]);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        console.error('Erreur:', e);
      }
    }
  }, [currentTrack, isPlaying, playTrack]);

  const handlePrev = useCallback(() => {
    if (!currentTrack) return;
    if (progress > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      return;
    }
    const idx = demoTracks.findIndex(t => t.id === currentTrack.id);
    playTrack(demoTracks[idx > 0 ? idx - 1 : demoTracks.length - 1]);
  }, [currentTrack, progress, playTrack]);

  const handleNext = useCallback(() => {
    if (!currentTrack) {
      playTrack(demoTracks[0]);
      return;
    }
    const idx = demoTracks.findIndex(t => t.id === currentTrack.id);
    let nextIdx = shuffle
      ? Math.floor(Math.random() * demoTracks.length)
      : (idx + 1) % demoTracks.length;
    playTrack(demoTracks[nextIdx]);
  }, [currentTrack, shuffle, playTrack]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setProgress(time);
    if (audioRef.current) audioRef.current.currentTime = time;
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFav = new Set(prev);
      newFav.has(id) ? newFav.delete(id) : newFav.add(id);
      return newFav;
    });
  };

  const getTracksCount = (playlistId: string) => {
    if (playlistId === 'all') return demoTracks.length;
    if (playlistId === 'favorites') return favorites.size;
    return 0;
  };

  const displayedTracks = demoTracks
    .filter(t => {
      const matchesPlaylist = selectedPlaylist === 'all' ||
        (selectedPlaylist === 'favorites' && favorites.has(t.id));
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.artist.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPlaylist && matchesSearch;
    });

  return (
    <div className="flex h-full bg-[#1c1c1e]">
      {/* Sidebar */}
      <div
        className="w-56 bg-[#2c2c2e] border-r border-white/10 flex flex-col"
        style={{ padding: '16px 0' }}
      >
        {/* App Title */}
        <div style={{ padding: '0 20px', marginBottom: '20px' }}>
          <h1 className="text-white/90 text-lg font-semibold flex items-center gap-2">
            <span className="text-2xl">🎵</span> Musique
          </h1>
        </div>

        {/* Playlists */}
        <div className="flex-1 overflow-auto" style={{ padding: '0 12px' }}>
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => setSelectedPlaylist(playlist.id)}
              className={`w-full flex items-center gap-3 rounded-lg transition-colors ${
                selectedPlaylist === playlist.id
                  ? 'bg-[#3a3a3c] text-white'
                  : 'text-white/70 hover:bg-white/5'
              }`}
              style={{ padding: '10px 12px', marginBottom: '4px' }}
            >
              <span className="text-lg">{playlist.icon}</span>
              <span className="flex-1 text-left text-sm">{playlist.name}</span>
              <span className="text-xs text-white/40">{getTracksCount(playlist.id)}</span>
            </button>
          ))}
        </div>

        {/* Now Playing Mini */}
        {currentTrack && (
          <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-3">
              <AlbumArt track={currentTrack} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">{currentTrack.title}</div>
                <div className="text-white/50 text-xs truncate">{currentTrack.artist}</div>
              </div>
            </div>
            {/* Mini progress */}
            <div
              className="bg-white/20 rounded-full overflow-hidden"
              style={{ height: '3px', marginTop: '10px' }}
            >
              <div
                className="h-full bg-[#0a84ff]"
                style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Track List Panel */}
      <div className="w-80 bg-[#252528] border-r border-white/10 flex flex-col">
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

        {/* Tracks Count */}
        <div
          className="text-white/40 text-xs font-medium uppercase tracking-wider border-b border-white/10"
          style={{ padding: '0 20px 12px' }}
        >
          {displayedTracks.length} titre{displayedTracks.length !== 1 ? 's' : ''}
        </div>

        {/* Tracks List */}
        <div className="flex-1 overflow-auto" style={{ padding: '8px' }}>
          <AnimatePresence>
            {displayedTracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.02 }}
                className={`rounded-xl cursor-pointer transition-colors ${
                  currentTrack?.id === track.id
                    ? 'bg-[#0a84ff]'
                    : 'hover:bg-white/5'
                }`}
                style={{ padding: '12px 14px', marginBottom: '6px' }}
                onClick={() => playTrack(track)}
              >
                <div className="flex items-center gap-3">
                  {/* Playing indicator or number */}
                  <div className="w-5 text-center flex-shrink-0">
                    {currentTrack?.id === track.id && isPlaying ? (
                      <div className="flex items-end justify-center gap-0.5 h-4">
                        {[1, 2, 3].map(i => (
                          <motion.div
                            key={i}
                            className="w-1 rounded-full"
                            style={{ backgroundColor: currentTrack?.id === track.id ? 'white' : '#0a84ff' }}
                            animate={{ height: [3, 12, 3] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className={`text-xs ${currentTrack?.id === track.id ? 'text-white/70' : 'text-white/40'}`}>
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Album art */}
                  <AlbumArt track={track} size="sm" />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm truncate ${
                      currentTrack?.id === track.id ? 'text-white' : 'text-white'
                    }`}>
                      {track.title}
                    </div>
                    <div className={`text-xs mt-0.5 truncate ${
                      currentTrack?.id === track.id ? 'text-white/70' : 'text-white/50'
                    }`}>
                      {track.artist}
                    </div>
                  </div>

                  {/* Duration & Favorite */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(track.id); }}
                      className={`p-1 transition-colors ${
                        favorites.has(track.id)
                          ? currentTrack?.id === track.id ? 'text-white' : 'text-red-400'
                          : currentTrack?.id === track.id ? 'text-white/50' : 'text-white/20'
                      } hover:scale-110`}
                    >
                      {favorites.has(track.id) ? '❤️' : '🤍'}
                    </button>
                    <span className={`text-xs ${
                      currentTrack?.id === track.id ? 'text-white/70' : 'text-white/40'
                    }`}>
                      {formatTime(track.duration)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {displayedTracks.length === 0 && (
            <div className="flex flex-col items-center justify-center text-white/40 text-sm" style={{ padding: '40px 20px' }}>
              <span className="text-4xl mb-3">🔍</span>
              <span>Aucun titre trouve</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Player Panel */}
      <div className="flex-1 flex flex-col bg-[#1c1c1e]">
        {currentTrack ? (
          <>
            {/* Album Art Large */}
            <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: '40px' }}>
              <motion.div
                animate={isPlaying ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <AlbumArt track={currentTrack} size="lg" />
              </motion.div>

              <div className="text-center" style={{ marginTop: '32px' }}>
                <div className="text-white text-2xl font-semibold">{currentTrack.title}</div>
                <div className="text-white/50 text-lg" style={{ marginTop: '8px' }}>{currentTrack.artist}</div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ padding: '0 40px 40px' }}>
              {/* Progress Bar */}
              <div className="flex items-center gap-3" style={{ marginBottom: '24px' }}>
                <span className="text-white/50 text-xs w-10 text-right">{formatTime(progress)}</span>
                <div className="flex-1 relative">
                  <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0a84ff] rounded-full"
                      style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={progress}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <span className="text-white/50 text-xs w-10">{formatTime(duration)}</span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-6">
                <button
                  className={`p-2 transition-colors ${shuffle ? 'text-[#0a84ff]' : 'text-white/40 hover:text-white'}`}
                  onClick={() => setShuffle(!shuffle)}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="16,3 21,3 21,8"/><line x1="4" y1="20" x2="21" y2="3"/>
                    <polyline points="21,16 21,21 16,21"/><line x1="15" y1="15" x2="21" y2="21"/>
                    <line x1="4" y1="4" x2="9" y2="9"/>
                  </svg>
                </button>

                <button
                  className="p-2 text-white/60 hover:text-white transition-colors"
                  onClick={handlePrev}
                >
                  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                  </svg>
                </button>

                <motion.button
                  className="w-16 h-16 flex items-center justify-center bg-[#0a84ff] hover:bg-[#0077ed] rounded-full text-white shadow-lg"
                  onClick={togglePlay}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading ? (
                    <motion.div
                      className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : isPlaying ? (
                    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1"/>
                      <rect x="14" y="4" width="4" height="16" rx="1"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-8 h-8 ml-1" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </motion.button>

                <button
                  className="p-2 text-white/60 hover:text-white transition-colors"
                  onClick={handleNext}
                >
                  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                  </svg>
                </button>

                <button
                  className={`p-2 relative transition-colors ${repeat !== 'off' ? 'text-[#0a84ff]' : 'text-white/40 hover:text-white'}`}
                  onClick={() => setRepeat(repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off')}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="17,1 21,5 17,9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                    <polyline points="7,23 3,19 7,15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                  </svg>
                  {repeat === 'one' && (
                    <span className="absolute -top-1 -right-1 text-[10px] font-bold text-[#0a84ff]">1</span>
                  )}
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center justify-center gap-3" style={{ marginTop: '24px' }}>
                <button
                  className="text-white/40 hover:text-white transition-colors"
                  onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                    {volume === 0 ? (
                      <>
                        <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/>
                        <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
                      </>
                    ) : (
                      <>
                        <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                      </>
                    )}
                  </svg>
                </button>
                <div className="w-32 relative">
                  <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white/60 rounded-full" style={{ width: `${volume * 100}%` }} />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/40">
            <div className="text-center" style={{ padding: '40px' }}>
              <div className="text-6xl mb-4">🎵</div>
              <div className="text-xl mb-2">Aucune musique selectionnee</div>
              <div className="text-sm text-white/30">Selectionnez un titre pour commencer</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
