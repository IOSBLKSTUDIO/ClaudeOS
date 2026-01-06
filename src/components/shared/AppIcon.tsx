import type { AppId } from '../../types';
import type { ReactElement } from 'react';

interface AppIconProps {
  appId: AppId;
  size?: number;
  className?: string;
}

// Professional macOS-style icons with gradients and shadows
const icons: Record<AppId, ReactElement> = {
  finder: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Background gradient */}
        <linearGradient id="finderBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3AACF3" />
          <stop offset="100%" stopColor="#1665D8" />
        </linearGradient>
        {/* Left face - lighter blue */}
        <linearGradient id="finderLeft" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5AC6F8" />
          <stop offset="100%" stopColor="#3BA1E8" />
        </linearGradient>
        {/* Right face - darker blue */}
        <linearGradient id="finderRight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1D7FE0" />
          <stop offset="100%" stopColor="#1058B0" />
        </linearGradient>
        <clipPath id="finderClip">
          <rect x="8" y="8" width="104" height="104" rx="24" />
        </clipPath>
      </defs>
      {/* Background */}
      <rect x="8" y="8" width="104" height="104" rx="24" fill="url(#finderBg)" />
      {/* Face container */}
      <g clipPath="url(#finderClip)">
        {/* Left half - light blue */}
        <rect x="8" y="8" width="52" height="104" fill="url(#finderLeft)" />
        {/* Right half - dark blue */}
        <rect x="60" y="8" width="52" height="104" fill="url(#finderRight)" />
      </g>
      {/* Face outline highlight */}
      <rect x="8" y="8" width="104" height="104" rx="24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      {/* Left eye */}
      <ellipse cx="42" cy="52" rx="8" ry="12" fill="#fff" />
      <ellipse cx="44" cy="54" rx="4" ry="6" fill="#1a1a2e" />
      {/* Right eye */}
      <ellipse cx="78" cy="52" rx="8" ry="12" fill="#fff" />
      <ellipse cx="76" cy="54" rx="4" ry="6" fill="#1a1a2e" />
      {/* Nose line */}
      <line x1="60" y1="58" x2="60" y2="72" stroke="#0D4A8A" strokeWidth="2" strokeLinecap="round" />
      {/* Smile */}
      <path d="M38 82 Q60 100 82 82" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M38 82 Q60 98 82 82" stroke="#0D4A8A" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Teeth hint */}
      <rect x="48" y="82" width="24" height="8" rx="2" fill="#fff" opacity="0.9" />
    </svg>
  ),
  terminal: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="termBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#434343" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="104" height="104" rx="24" fill="url(#termBg)" />
      <rect x="8" y="8" width="104" height="52" rx="24" fill="#2d2d2d" />
      <rect x="8" y="36" width="104" height="76" rx="24" fill="url(#termBg)" />
      <path d="M30 50 L50 65 L30 80" stroke="#32D74B" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="58" y="75" width="32" height="5" rx="2.5" fill="#32D74B" />
    </svg>
  ),
  notes: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="notesBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD662" />
          <stop offset="100%" stopColor="#FF9500" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="104" height="104" rx="24" fill="url(#notesBg)" />
      <rect x="24" y="24" width="72" height="80" rx="8" fill="#FFFEF0" />
      <rect x="24" y="24" width="72" height="16" rx="8" fill="#FFF9C4" />
      <rect x="32" y="48" width="56" height="4" rx="2" fill="#E0E0E0" />
      <rect x="32" y="58" width="48" height="4" rx="2" fill="#E0E0E0" />
      <rect x="32" y="68" width="52" height="4" rx="2" fill="#E0E0E0" />
      <rect x="32" y="78" width="36" height="4" rx="2" fill="#E0E0E0" />
      <rect x="32" y="88" width="44" height="4" rx="2" fill="#E0E0E0" />
    </svg>
  ),
  calculator: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="calcBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A4A4A" />
          <stop offset="100%" stopColor="#2D2D2D" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="104" height="104" rx="24" fill="url(#calcBg)" />
      <rect x="18" y="18" width="84" height="28" rx="6" fill="#1C1C1E" />
      <text x="94" y="38" fill="#fff" fontSize="20" fontFamily="system-ui" textAnchor="end" fontWeight="300">1,234</text>
      <circle cx="34" cy="62" r="10" fill="#FF9F0A" />
      <circle cx="60" cy="62" r="10" fill="#636366" />
      <circle cx="86" cy="62" r="10" fill="#636366" />
      <circle cx="34" cy="88" r="10" fill="#636366" />
      <circle cx="60" cy="88" r="10" fill="#636366" />
      <circle cx="86" cy="88" r="10" fill="#0A84FF" />
      <text x="34" y="66" fill="#fff" fontSize="14" textAnchor="middle" fontWeight="500">C</text>
      <text x="60" y="66" fill="#fff" fontSize="14" textAnchor="middle">7</text>
      <text x="86" y="66" fill="#fff" fontSize="14" textAnchor="middle">8</text>
      <text x="34" y="92" fill="#fff" fontSize="14" textAnchor="middle">4</text>
      <text x="60" y="92" fill="#fff" fontSize="14" textAnchor="middle">5</text>
      <text x="86" y="92" fill="#fff" fontSize="14" textAnchor="middle">=</text>
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="settingsBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#78788C" />
          <stop offset="50%" stopColor="#5E5E6E" />
          <stop offset="100%" stopColor="#48484F" />
        </linearGradient>
        <linearGradient id="gearGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#AEAEB5" />
          <stop offset="30%" stopColor="#8E8E95" />
          <stop offset="70%" stopColor="#6E6E75" />
          <stop offset="100%" stopColor="#58585F" />
        </linearGradient>
        <linearGradient id="gearInner" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#58585F" />
          <stop offset="100%" stopColor="#3A3A40" />
        </linearGradient>
      </defs>
      {/* Background */}
      <rect x="8" y="8" width="104" height="104" rx="24" fill="url(#settingsBg)" />
      {/* Gear */}
      <g transform="translate(60, 60)">
        {/* Outer gear teeth */}
        <path
          d="M-8,-42 L8,-42 L10,-32 C12,-32 14,-31 16,-30 L24,-38 L38,-24 L30,-16 C31,-14 32,-12 32,-10 L42,-8 L42,8 L32,10 C32,12 31,14 30,16 L38,24 L24,38 L16,30 C14,31 12,32 10,32 L8,42 L-8,42 L-10,32 C-12,32 -14,31 -16,30 L-24,38 L-38,24 L-30,16 C-31,14 -32,12 -32,10 L-42,8 L-42,-8 L-32,-10 C-32,-12 -31,-14 -30,-16 L-38,-24 L-24,-38 L-16,-30 C-14,-31 -12,-32 -10,-32 Z"
          fill="url(#gearGradient)"
        />
        {/* Inner circle cutout */}
        <circle r="16" fill="url(#gearInner)" />
        {/* Center highlight */}
        <circle r="8" fill="url(#gearGradient)" />
        <circle r="5" fill="url(#gearInner)" />
        {/* Top shine */}
        <ellipse cx="0" cy="-28" rx="6" ry="3" fill="rgba(255,255,255,0.3)" />
      </g>
      {/* Border highlight */}
      <rect x="8" y="8" width="104" height="104" rx="24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
    </svg>
  ),
  safari: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="safariBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5AC8FA" />
          <stop offset="100%" stopColor="#007AFF" />
        </linearGradient>
        <linearGradient id="safariNeedle" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF3B30" />
          <stop offset="50%" stopColor="#FF3B30" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="104" height="104" rx="24" fill="url(#safariBg)" />
      <circle cx="60" cy="60" r="42" fill="none" stroke="#fff" strokeWidth="3" opacity="0.9" />
      <circle cx="60" cy="60" r="38" fill="none" stroke="#fff" strokeWidth="1" opacity="0.4" />
      <polygon points="60,22 66,54 98,60 66,66 60,98 54,66 22,60 54,54" fill="#fff" />
      <polygon points="60,30 63,56 90,60 63,64 60,90 57,64 30,60 57,56" fill="url(#safariBg)" />
      <line x1="60" y1="26" x2="60" y2="34" stroke="#fff" strokeWidth="2" opacity="0.6" />
      <line x1="60" y1="86" x2="60" y2="94" stroke="#fff" strokeWidth="2" opacity="0.6" />
      <line x1="26" y1="60" x2="34" y2="60" stroke="#fff" strokeWidth="2" opacity="0.6" />
      <line x1="86" y1="60" x2="94" y2="60" stroke="#fff" strokeWidth="2" opacity="0.6" />
    </svg>
  ),
  music: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="musicBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FC5C7D" />
          <stop offset="50%" stopColor="#E84565" />
          <stop offset="100%" stopColor="#C9234A" />
        </linearGradient>
        <linearGradient id="musicShine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      {/* Background */}
      <rect x="8" y="8" width="104" height="104" rx="24" fill="url(#musicBg)" />
      {/* Shine overlay */}
      <rect x="8" y="8" width="104" height="52" rx="24" fill="url(#musicShine)" />
      {/* Musical note */}
      <g transform="translate(30, 22)">
        {/* Note head left */}
        <ellipse cx="14" cy="62" rx="14" ry="11" fill="#fff" transform="rotate(-20, 14, 62)" />
        {/* Note head right */}
        <ellipse cx="50" cy="52" rx="14" ry="11" fill="#fff" transform="rotate(-20, 50, 52)" />
        {/* Stem left */}
        <rect x="24" y="12" width="5" height="54" rx="2" fill="#fff" />
        {/* Stem right */}
        <rect x="60" y="2" width="5" height="54" rx="2" fill="#fff" />
        {/* Flag/beam */}
        <path d="M24 12 C35 8, 50 6, 60 2 L60 14 C50 18, 35 20, 24 24 Z" fill="#fff" />
      </g>
      {/* Border highlight */}
      <rect x="8" y="8" width="104" height="104" rx="24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
    </svg>
  ),
  photos: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="photosBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="25%" stopColor="#FFE66D" />
          <stop offset="50%" stopColor="#4ECDC4" />
          <stop offset="75%" stopColor="#45B7D1" />
          <stop offset="100%" stopColor="#96E6A1" />
        </linearGradient>
        <radialGradient id="photosInner" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F0F0F0" />
        </radialGradient>
      </defs>
      <rect x="8" y="8" width="104" height="104" rx="24" fill="url(#photosBg)" />
      <circle cx="60" cy="60" r="36" fill="url(#photosInner)" />
      <circle cx="60" cy="60" r="28" fill="url(#photosBg)" />
      <ellipse cx="60" cy="50" rx="16" ry="10" fill="#fff" opacity="0.5" />
      <circle cx="60" cy="60" r="8" fill="#fff" opacity="0.8" />
    </svg>
  ),
  snake: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="snakeBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#0a0a0f" />
        </linearGradient>
        <linearGradient id="snakeBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="snakeHead" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      {/* Background */}
      <rect x="8" y="8" width="104" height="104" rx="24" fill="url(#snakeBg)" />
      {/* Grid pattern */}
      <g opacity="0.1">
        <line x1="28" y1="8" x2="28" y2="112" stroke="#10b981" strokeWidth="1" />
        <line x1="48" y1="8" x2="48" y2="112" stroke="#10b981" strokeWidth="1" />
        <line x1="68" y1="8" x2="68" y2="112" stroke="#10b981" strokeWidth="1" />
        <line x1="88" y1="8" x2="88" y2="112" stroke="#10b981" strokeWidth="1" />
        <line x1="8" y1="28" x2="112" y2="28" stroke="#10b981" strokeWidth="1" />
        <line x1="8" y1="48" x2="112" y2="48" stroke="#10b981" strokeWidth="1" />
        <line x1="8" y1="68" x2="112" y2="68" stroke="#10b981" strokeWidth="1" />
        <line x1="8" y1="88" x2="112" y2="88" stroke="#10b981" strokeWidth="1" />
      </g>
      {/* Snake body */}
      <path
        d="M30 70 L30 50 L50 50 L50 70 L70 70 L70 50 L90 50 L90 70"
        stroke="url(#snakeBody)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Snake head */}
      <circle cx="90" cy="70" r="10" fill="url(#snakeHead)" />
      {/* Snake eyes */}
      <circle cx="92" cy="67" r="2" fill="#fff" />
      <circle cx="92" cy="67" r="1" fill="#0a0a0f" />
      {/* Tongue */}
      <path d="M100 70 L106 66 M100 70 L106 74" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      {/* Food */}
      <circle cx="30" cy="90" r="6" fill="#ef4444" />
      <circle cx="30" cy="90" r="3" fill="#fca5a5" opacity="0.5" />
      {/* Glow effect */}
      <circle cx="90" cy="70" r="14" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.3" />
      {/* Border */}
      <rect x="8" y="8" width="104" height="104" rx="24" fill="none" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="2" />
    </svg>
  ),
};

export function AppIcon({ appId, size = 52, className = '' }: AppIconProps) {
  return (
    <div
      className={`flex-shrink-0 icon-shadow ${className}`}
      style={{ width: size, height: size }}
    >
      {icons[appId]}
    </div>
  );
}
