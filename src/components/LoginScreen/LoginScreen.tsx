import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginScreenProps {
  onLogin: () => void;
}

const CORRECT_PASSWORD = '0000';

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  city: string;
}

const defaultWeather: WeatherData = {
  temp: 18,
  condition: 'Chargement...',
  icon: 'sunny',
  city: 'Paris',
};

// Liste des villes populaires pour l'autocomplétion
const popularCities = [
  'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier',
  'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre', 'Saint-Etienne', 'Toulon', 'Grenoble',
  'Dijon', 'Angers', 'Nimes', 'Villeurbanne', 'Clermont-Ferrand', 'Le Mans', 'Aix-en-Provence',
  'Brest', 'Tours', 'Amiens', 'Limoges', 'Annecy', 'Perpignan', 'Besancon', 'Metz', 'Orleans',
  'Rouen', 'Mulhouse', 'Caen', 'Nancy', 'Avignon', 'Cannes', 'Monaco',
  'Londres', 'New York', 'Tokyo', 'Berlin', 'Madrid', 'Rome', 'Amsterdam', 'Barcelone',
  'Bruxelles', 'Geneve', 'Zurich', 'Los Angeles', 'Miami', 'Sydney', 'Dubai', 'Singapore',
];

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData>(defaultWeather);
  const [showCityModal, setShowCityModal] = useState(false);
  const [cityInput, setCityInput] = useState('Paris');
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // Fetch weather data
  const fetchWeather = async (city: string) => {
    setIsLoadingWeather(true);
    try {
      const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
      const data = await response.json();

      const current = data.current_condition[0];
      const tempC = parseInt(current.temp_C);
      const condition = current.lang_fr?.[0]?.value || current.weatherDesc[0].value;

      setWeather({
        temp: tempC,
        condition: condition,
        icon: current.weatherCode,
        city: city,
      });

      // Save to localStorage
      localStorage.setItem('weatherCity', city);
    } catch (err) {
      console.error('Erreur météo:', err);
      setWeather({
        ...defaultWeather,
        city: city,
        condition: 'Indisponible',
      });
    }
    setIsLoadingWeather(false);
  };

  // Load saved city and fetch weather on mount
  useEffect(() => {
    const savedCity = localStorage.getItem('weatherCity') || 'Paris';
    setCityInput(savedCity);
    fetchWeather(savedCity);
  }, []);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === CORRECT_PASSWORD) {
      setIsLoggingIn(true);
      setError(false);
      setTimeout(() => {
        onLogin();
      }, 800);
    } else {
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const WeatherIcon = () => (
    <svg viewBox="0 0 64 64" className="w-12 h-12">
      {/* Sun */}
      <circle cx="26" cy="26" r="10" fill="#FFD93D" />
      <g stroke="#FFD93D" strokeWidth="2" strokeLinecap="round">
        <line x1="26" y1="8" x2="26" y2="12" />
        <line x1="26" y1="40" x2="26" y2="44" />
        <line x1="8" y1="26" x2="12" y2="26" />
        <line x1="40" y1="26" x2="44" y2="26" />
        <line x1="13" y1="13" x2="16" y2="16" />
        <line x1="36" y1="36" x2="39" y2="39" />
        <line x1="13" y1="39" x2="16" y2="36" />
        <line x1="36" y1="16" x2="39" y2="13" />
      </g>
      {/* Cloud */}
      <path
        d="M52 42c4.4 0 8-3.6 8-8s-3.6-8-8-8c-.7 0-1.4.1-2 .3C48.4 21.5 44 18 38.5 18c-6.9 0-12.5 5.6-12.5 12.5 0 .5 0 1 .1 1.5-3.5.9-6.1 4-6.1 7.8 0 4.4 3.6 8 8 8h24z"
        fill="rgba(255,255,255,0.9)"
      />
    </svg>
  );

  return (
    <AnimatePresence>
      {!isLoggingIn ? (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {/* Background */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1536152470836-b943b246224c?w=1920)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)',
              backdropFilter: 'blur(2px)',
            }}
          />

          {/* Top Section - Title & Time */}
          <div className="relative z-10 pt-12 text-center">
            {/* Welcome Title */}
            <motion.h1
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-2xl font-medium text-white/90 tracking-wide mb-10"
            >
              Bienvenue sur ClaudeOS
            </motion.h1>

            {/* Time */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="text-8xl font-extralight text-white tracking-tight mb-3"
                style={{ textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
                {formatTime(currentTime)}
              </div>
              <div className="text-2xl text-white/80 capitalize font-light">
                {formatDate(currentTime)}
              </div>
            </motion.div>
          </div>

          {/* Middle Section - Login */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', damping: 20 }}
              className="flex flex-col items-center"
            >
              {/* Profile Picture */}
              <div
                className="w-32 h-32 rounded-full overflow-hidden shadow-2xl ring-4 ring-white/30"
                style={{
                  marginBottom: '15px',
                }}
              >
                <img
                  src={`${import.meta.env.BASE_URL}profile.png`}
                  alt="LePtitDev"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Username */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-2xl text-white font-medium"
                style={{ textShadow: '0 1px 10px rgba(0,0,0,0.3)', marginBottom: '50px' }}
              >
                LePtitDev 🇫🇷
              </motion.div>

              {/* Password Input */}
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
              >
                <motion.div
                  animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Entrer le mot de passe"
                      autoFocus
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-bwignore="true"
                      data-form-type="other"
                      aria-autocomplete="none"
                      className={`
                        w-80 px-5 py-4 pr-14 rounded-2xl text-center text-white text-base
                        bg-white/15 backdrop-blur-xl border-2
                        outline-none transition-all duration-200
                        placeholder-white/50
                        ${error
                          ? 'border-red-500/60 bg-red-500/20'
                          : 'border-white/20 focus:border-white/50 focus:bg-white/20'
                        }
                      `}
                      style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.2)' }}
                    />
                    {password && (
                      <button
                        type="submit"
                        className="absolute right-4 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform duration-200"
                      >
                        <svg viewBox="0 0 20 20" className="w-6 h-6 text-white/70 hover:text-white">
                          <path
                            d="M5 10l4 4 6-7"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </motion.div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-red-400 text-sm mt-3 text-center font-medium"
                    >
                      Mot de passe incorrect
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.form>

              {/* Hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="relative group"
                style={{ marginTop: '20px' }}
              >
                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  title="Indice"
                >
                  <span className="text-white/60 text-sm font-serif italic">i</span>
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/80 backdrop-blur-xl rounded-lg text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Indice Mot de passe : 0000
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Weather Widget - Top Right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="absolute top-8 right-10 z-10 flex items-center gap-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10"
            style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.2)', padding: '20px 25px' }}
          >
            <WeatherIcon />
            <div>
              <div className="text-2xl font-light text-white" style={{ marginBottom: '5px' }}>
                {isLoadingWeather ? '...' : `${weather.temp}°C`}
              </div>
              <div className="text-white/60 text-sm">{weather.condition}</div>
              <div className="text-white/40 text-xs" style={{ marginTop: '3px' }}>{weather.city}</div>
            </div>
            {/* Settings button */}
            <button
              onClick={() => setShowCityModal(true)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors ml-2"
              title="Changer de ville"
            >
              <span className="text-white/60 text-xs font-serif italic">i</span>
            </button>
          </motion.div>

          {/* City Selection Modal */}
          <AnimatePresence>
            {showCityModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                onClick={() => setShowCityModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-gray-800/95 backdrop-blur-xl rounded-2xl border border-white/10 w-96"
                  style={{ boxShadow: '0 10px 50px rgba(0,0,0,0.5)', padding: '30px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-white text-xl font-medium" style={{ marginBottom: '20px' }}>Choisir une ville</h3>
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    placeholder="Rechercher une ville..."
                    className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none focus:border-white/40"
                    style={{ marginBottom: '15px' }}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && cityInput.trim()) {
                        fetchWeather(cityInput);
                        setShowCityModal(false);
                      }
                    }}
                  />

                  {/* City suggestions */}
                  {cityInput.length > 0 && (
                    <div
                      className="rounded-xl bg-white/5 border border-white/10 overflow-hidden"
                      style={{ marginBottom: '20px', maxHeight: '200px', overflowY: 'auto' }}
                    >
                      {popularCities
                        .filter(city => city.toLowerCase().includes(cityInput.toLowerCase()))
                        .slice(0, 6)
                        .map((city) => (
                          <button
                            key={city}
                            onClick={() => {
                              setCityInput(city);
                              fetchWeather(city);
                              setShowCityModal(false);
                            }}
                            className="w-full px-5 py-3 text-left text-white/80 hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
                          >
                            {city}
                          </button>
                        ))}
                      {popularCities.filter(city => city.toLowerCase().includes(cityInput.toLowerCase())).length === 0 && (
                        <div className="px-5 py-3 text-white/40 text-sm">
                          Appuyez sur Entree pour rechercher "{cityInput}"
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowCityModal(false)}
                      className="flex-1 px-5 py-3 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => {
                        if (cityInput.trim()) {
                          fetchWeather(cityInput);
                          setShowCityModal(false);
                        }
                      }}
                      className="flex-1 px-5 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    >
                      Valider
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Section - Action Buttons Only */}
          <div className="relative z-10 pb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center gap-6"
            >
              <button className="flex flex-col items-center gap-2 px-5 py-3 rounded-xl hover:bg-white/10 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur flex items-center justify-center group-hover:bg-white/25 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-white/80">
                    <path d="M12 3a9 9 0 0 0-9 9v9h18v-9a9 9 0 0 0-9-9z" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="3" fill="currentColor" />
                  </svg>
                </div>
                <span className="text-sm text-white/60">Veille</span>
              </button>
              <button className="flex flex-col items-center gap-2 px-5 py-3 rounded-xl hover:bg-white/10 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur flex items-center justify-center group-hover:bg-white/25 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-white/80">
                    <path d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66l1.42-1.42M4.92 19.08l1.42-1.42m0-11.32L4.92 4.92m14.16 14.16l-1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <span className="text-sm text-white/60">Redemarrer</span>
              </button>
              <button className="flex flex-col items-center gap-2 px-5 py-3 rounded-xl hover:bg-white/10 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur flex items-center justify-center group-hover:bg-white/25 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-white/80">
                    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 6v2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-sm text-white/60">Eteindre</span>
              </button>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        /* Loading animation during login */
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            {/* Apple-style loading */}
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin" />
            </div>
            <span className="text-white/70 text-lg font-light">Connexion en cours...</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
