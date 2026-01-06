import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const GRID_SIZE = 20;
const CELL_SIZE = 22;
const INITIAL_SPEED = 120;

// Sound effect for eating food
const playEatSound = () => {
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

  // Create oscillator for a "pop" sound
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(1320, audioContext.currentTime + 0.05);
  oscillator.frequency.exponentialRampToValueAtTime(660, audioContext.currentTime + 0.1);

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.15);
};

export default function Snake() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 10 });
  const [foodKey, setFoodKey] = useState(0); // Key to force re-render without transition
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [wrapMode, setWrapMode] = useState(false); // Invisible walls mode
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('claudeos-snake-highscore');
    return saved ? parseInt(saved) : 0;
  });
  const directionRef = useRef(direction);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate random food position
  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setFoodKey(prev => prev + 1);
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsPaused(true);
  }, [generateFood]);

  // Toggle pause
  const togglePause = useCallback(() => {
    if (!gameOver) {
      setIsPaused(prev => !prev);
    }
  }, [gameOver]);

  // Game loop
  useEffect(() => {
    if (isPaused || gameOver) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    gameLoopRef.current = setInterval(() => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        const currentDirection = directionRef.current;

        switch (currentDirection) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
        }

        // Handle wall collision based on wrap mode
        if (wrapMode) {
          // Wrap around
          if (head.x < 0) head.x = GRID_SIZE - 1;
          if (head.x >= GRID_SIZE) head.x = 0;
          if (head.y < 0) head.y = GRID_SIZE - 1;
          if (head.y >= GRID_SIZE) head.y = 0;
        } else {
          // Check wall collision
          if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            setGameOver(true);
            return prevSnake;
          }
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          if (soundEnabled) {
            playEatSound();
          }
          setScore(prev => {
            const newScore = prev + 10;
            if (newScore > highScore) {
              setHighScore(newScore);
              localStorage.setItem('claudeos-snake-highscore', newScore.toString());
            }
            return newScore;
          });
          // Increase speed slightly
          setSpeed(prev => Math.max(60, prev - 3));
          const newFoodPos = generateFood(newSnake);
          setFood(newFoodPos);
          setFoodKey(prev => prev + 1); // Force instant re-render
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isPaused, gameOver, food, generateFood, speed, highScore, wrapMode, soundEnabled]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          if (directionRef.current !== 'DOWN') {
            directionRef.current = 'UP';
            setDirection('UP');
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          if (directionRef.current !== 'UP') {
            directionRef.current = 'DOWN';
            setDirection('DOWN');
          }
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          if (directionRef.current !== 'RIGHT') {
            directionRef.current = 'LEFT';
            setDirection('LEFT');
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          if (directionRef.current !== 'LEFT') {
            directionRef.current = 'RIGHT';
            setDirection('RIGHT');
          }
          break;
        case ' ':
          e.preventDefault();
          togglePause();
          break;
        case 'Escape':
          e.preventDefault();
          resetGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, resetGame, togglePause]);

  // Calculate transition duration based on speed
  const transitionDuration = speed / 1000;

  return (
    <div className="h-full bg-[#1c1c1e] flex flex-col select-none">
      {/* Header */}
      <div
        className="border-b border-white/10 flex items-center justify-between"
        style={{ padding: '12px 20px' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🐍</span>
          <span className="text-white text-lg font-semibold">Snake</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-white/40 text-[10px] uppercase tracking-wider">Score</div>
            <div className="text-white text-xl font-bold">{score}</div>
          </div>
          <div className="text-center">
            <div className="text-white/40 text-[10px] uppercase tracking-wider">Record</div>
            <div className="text-[#ffd60a] text-xl font-bold">{highScore}</div>
          </div>
        </div>
      </div>

      {/* Options bar */}
      <div
        className="border-b border-white/10 flex items-center justify-between"
        style={{ padding: '8px 20px' }}
      >
        <div className="flex items-center gap-4">
          {/* Pause Button */}
          <button
            onClick={togglePause}
            disabled={gameOver}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isPaused && !gameOver
                ? 'bg-[#10b981] text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/15'
            } ${gameOver ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isPaused ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                Jouer
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
                </svg>
                Pause
              </>
            )}
          </button>

          {/* Reset Button */}
          <button
            onClick={resetGame}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/10 text-white/70 hover:bg-white/15 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
              soundEnabled
                ? 'bg-white/10 text-white/70'
                : 'bg-white/5 text-white/40'
            }`}
            title={soundEnabled ? 'Son activé' : 'Son désactivé'}
          >
            {soundEnabled ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" />
              </svg>
            )}
          </button>

          {/* Wrap Mode Toggle */}
          <button
            onClick={() => setWrapMode(!wrapMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
              wrapMode
                ? 'bg-[#8b5cf6] text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/15'
            }`}
            title={wrapMode ? 'Murs invisibles activés' : 'Murs normaux'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            {wrapMode ? 'Traverser' : 'Murs'}
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center" style={{ padding: '16px' }}>
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
            background: 'linear-gradient(145deg, #0a0a0f 0%, #0f0f18 100%)',
            boxShadow: wrapMode
              ? '0 0 60px rgba(139, 92, 246, 0.2), inset 0 0 80px rgba(0,0,0,0.6)'
              : '0 0 60px rgba(16, 185, 129, 0.15), inset 0 0 80px rgba(0,0,0,0.6)',
            border: wrapMode
              ? '2px solid rgba(139, 92, 246, 0.3)'
              : '2px solid rgba(16, 185, 129, 0.2)',
            transition: 'box-shadow 0.3s, border-color 0.3s',
          }}
        >
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                linear-gradient(${wrapMode ? 'rgba(139, 92, 246, 0.5)' : 'rgba(16, 185, 129, 0.5)'} 1px, transparent 1px),
                linear-gradient(90deg, ${wrapMode ? 'rgba(139, 92, 246, 0.5)' : 'rgba(16, 185, 129, 0.5)'} 1px, transparent 1px)
              `,
              backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
            }}
          />

          {/* Snake with smooth transitions */}
          {snake.map((segment, index) => {
            const isHead = index === 0;
            const segmentSize = CELL_SIZE - (isHead ? 2 : 4);
            const offset = isHead ? 1 : 2;

            return (
              <div
                key={index}
                className="absolute"
                style={{
                  width: segmentSize,
                  height: segmentSize,
                  left: segment.x * CELL_SIZE + offset,
                  top: segment.y * CELL_SIZE + offset,
                  background: isHead
                    ? 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)'
                    : `linear-gradient(135deg, rgba(16, 185, 129, ${1 - index * 0.025}) 0%, rgba(5, 150, 105, ${1 - index * 0.025}) 100%)`,
                  borderRadius: isHead ? '6px' : '4px',
                  boxShadow: isHead
                    ? '0 0 20px rgba(52, 211, 153, 0.6), inset 0 1px 0 rgba(255,255,255,0.2)'
                    : '0 0 8px rgba(16, 185, 129, 0.3)',
                  transition: `left ${transitionDuration}s linear, top ${transitionDuration}s linear`,
                  zIndex: 100 - index,
                }}
              >
                {/* Head eyes */}
                {isHead && (
                  <div className="absolute inset-0 flex items-center justify-center gap-1">
                    <div
                      className="w-2 h-2 bg-white rounded-full"
                      style={{
                        boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.3)',
                        transform: direction === 'LEFT' ? 'translateX(-2px)' :
                                   direction === 'RIGHT' ? 'translateX(2px)' :
                                   direction === 'UP' ? 'translateY(-2px)' : 'translateY(2px)'
                      }}
                    >
                      <div className="w-1 h-1 bg-[#0a0a0f] rounded-full mt-0.5 ml-0.5" />
                    </div>
                    <div
                      className="w-2 h-2 bg-white rounded-full"
                      style={{
                        boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.3)',
                        transform: direction === 'LEFT' ? 'translateX(-2px)' :
                                   direction === 'RIGHT' ? 'translateX(2px)' :
                                   direction === 'UP' ? 'translateY(-2px)' : 'translateY(2px)'
                      }}
                    >
                      <div className="w-1 h-1 bg-[#0a0a0f] rounded-full mt-0.5 ml-0.5" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Food - using key to force instant position change */}
          <motion.div
            key={foodKey}
            className="absolute"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: 1,
              boxShadow: [
                '0 0 15px rgba(239, 68, 68, 0.5)',
                '0 0 25px rgba(239, 68, 68, 0.8)',
                '0 0 15px rgba(239, 68, 68, 0.5)',
              ],
            }}
            transition={{
              scale: {
                duration: 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
              },
              opacity: {
                duration: 0.15,
              },
              boxShadow: {
                duration: 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
            style={{
              width: CELL_SIZE - 4,
              height: CELL_SIZE - 4,
              left: food.x * CELL_SIZE + 2,
              top: food.y * CELL_SIZE + 2,
              background: 'radial-gradient(circle at 30% 30%, #ff6b6b 0%, #ef4444 50%, #dc2626 100%)',
              borderRadius: '50%',
            }}
          />

          {/* Pause/Start Overlay */}
          {isPaused && !gameOver && (
            <motion.div
              className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="text-5xl mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎮
              </motion.div>
              <div className="text-white text-xl font-bold mb-2">Snake</div>
              <div className="text-white/60 text-sm mb-6">Appuyez sur Espace ou cliquez Jouer</div>
              <div className="text-white/40 text-xs space-y-1.5 text-center">
                <div className="flex items-center gap-2 justify-center">
                  <span className="px-2 py-0.5 bg-white/10 rounded text-[10px]">↑↓←→</span>
                  <span>ou</span>
                  <span className="px-2 py-0.5 bg-white/10 rounded text-[10px]">WASD</span>
                  <span>diriger</span>
                </div>
                <div><span className="px-2 py-0.5 bg-white/10 rounded text-[10px]">ESPACE</span> pause</div>
              </div>
              {wrapMode && (
                <div className="mt-4 px-3 py-1 bg-[#8b5cf6]/20 text-[#a78bfa] text-xs rounded-full">
                  Mode traverser activé
                </div>
              )}
            </motion.div>
          )}

          {/* Game Over Overlay */}
          {gameOver && (
            <motion.div
              className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="text-5xl mb-4"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 10 }}
              >
                💀
              </motion.div>
              <div className="text-white text-2xl font-bold mb-2">Game Over</div>
              <div className="text-white/70 text-lg mb-1">Score: {score}</div>
              {score === highScore && score > 0 && (
                <motion.div
                  className="text-[#ffd60a] text-sm mb-3 flex items-center gap-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  <span>🏆</span> Nouveau record !
                </motion.div>
              )}
              <motion.button
                className="mt-4 px-6 py-3 bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#34d399] hover:to-[#10b981] text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25"
                onClick={resetGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Rejouer
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Controls hint */}
      <div
        className="border-t border-white/10 flex items-center justify-center gap-6 text-white/40 text-xs"
        style={{ padding: '10px 20px' }}
      >
        <span>⬆️⬇️⬅️➡️ Diriger</span>
        <span>ESPACE Pause</span>
        <span>ECHAP Reset</span>
      </div>
    </div>
  );
}
