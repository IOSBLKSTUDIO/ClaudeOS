import { useSettingsStore } from '../../stores/settingsStore';

// macOS-style wallpapers with realistic gradients
const wallpapers: Record<string, { gradient: string; overlay?: string }> = {
  sequoia: {
    gradient: `
      radial-gradient(ellipse at 20% 80%, rgba(255, 107, 107, 0.4) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 20%, rgba(78, 205, 196, 0.4) 0%, transparent 50%),
      radial-gradient(ellipse at 40% 40%, rgba(107, 91, 149, 0.6) 0%, transparent 60%),
      radial-gradient(ellipse at 60% 60%, rgba(69, 105, 144, 0.5) 0%, transparent 50%),
      linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #1f4068 50%, #4a3f6b 70%, #2d3a4f 100%)
    `,
  },
  sonoma: {
    gradient: `
      radial-gradient(ellipse at 25% 25%, rgba(251, 168, 31, 0.5) 0%, transparent 40%),
      radial-gradient(ellipse at 75% 75%, rgba(220, 36, 48, 0.4) 0%, transparent 45%),
      radial-gradient(ellipse at 50% 50%, rgba(255, 123, 84, 0.3) 0%, transparent 50%),
      linear-gradient(160deg, #2d1f3d 0%, #1a1a2e 20%, #0d1421 40%, #162447 60%, #1f4068 80%, #2d3a4f 100%)
    `,
  },
  ventura: {
    gradient: `
      radial-gradient(ellipse at 30% 70%, rgba(99, 179, 237, 0.5) 0%, transparent 45%),
      radial-gradient(ellipse at 70% 30%, rgba(236, 72, 153, 0.4) 0%, transparent 40%),
      radial-gradient(ellipse at 50% 90%, rgba(45, 55, 72, 0.8) 0%, transparent 50%),
      linear-gradient(180deg, #1e3a5f 0%, #2d5a7b 25%, #3d7a9e 50%, #5a9bc0 75%, #1e3a5f 100%)
    `,
  },
  monterey: {
    gradient: `
      radial-gradient(ellipse at 20% 50%, rgba(147, 51, 234, 0.5) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 50%, rgba(79, 70, 229, 0.5) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 80%, rgba(59, 130, 246, 0.4) 0%, transparent 45%),
      linear-gradient(135deg, #4c1d95 0%, #5b21b6 25%, #6d28d9 50%, #7c3aed 75%, #4c1d95 100%)
    `,
  },
  bigsur: {
    gradient: `
      radial-gradient(ellipse at 10% 90%, rgba(251, 191, 36, 0.6) 0%, transparent 35%),
      radial-gradient(ellipse at 30% 70%, rgba(249, 115, 22, 0.5) 0%, transparent 40%),
      radial-gradient(ellipse at 50% 50%, rgba(236, 72, 153, 0.4) 0%, transparent 45%),
      radial-gradient(ellipse at 70% 30%, rgba(139, 92, 246, 0.4) 0%, transparent 40%),
      radial-gradient(ellipse at 90% 10%, rgba(59, 130, 246, 0.5) 0%, transparent 35%),
      linear-gradient(180deg, #1e40af 0%, #7c3aed 25%, #db2777 50%, #ea580c 75%, #fbbf24 100%)
    `,
  },
  catalina: {
    gradient: `
      radial-gradient(ellipse at 50% 0%, rgba(59, 130, 246, 0.6) 0%, transparent 50%),
      radial-gradient(ellipse at 0% 100%, rgba(30, 64, 175, 0.6) 0%, transparent 50%),
      radial-gradient(ellipse at 100% 100%, rgba(76, 29, 149, 0.5) 0%, transparent 50%),
      linear-gradient(180deg, #1e3a8a 0%, #1e40af 30%, #3b82f6 50%, #a78bfa 70%, #c084fc 100%)
    `,
  },
  mojave: {
    gradient: `
      radial-gradient(ellipse at 50% 100%, rgba(251, 146, 60, 0.3) 0%, transparent 40%),
      radial-gradient(ellipse at 50% 0%, rgba(30, 41, 59, 0.9) 0%, transparent 60%),
      linear-gradient(180deg, #0f172a 0%, #1e293b 30%, #334155 50%, #475569 70%, #1e293b 100%)
    `,
  },
  midnight: {
    gradient: `
      radial-gradient(ellipse at 50% 50%, rgba(30, 41, 59, 0.5) 0%, transparent 70%),
      radial-gradient(ellipse at 20% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 40%),
      radial-gradient(ellipse at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 40%),
      linear-gradient(180deg, #020617 0%, #0f172a 50%, #1e293b 100%)
    `,
  },
};

export function Wallpaper() {
  const wallpaper = useSettingsStore((s) => s.wallpaper);
  const config = wallpapers[wallpaper] || wallpapers.sequoia;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Main gradient */}
      <div
        className="absolute inset-0 transition-all duration-1000 ease-out"
        style={{ background: config.gradient }}
      />

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette effect */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 0%, rgba(0,0,0,0.15) 100%)',
        }}
      />
    </div>
  );
}

export const wallpaperOptions = Object.keys(wallpapers);
