import { useSettingsStore } from '../../stores/settingsStore';
import { Wallpaper } from './Wallpaper';
import { DesktopIcon } from './DesktopIcon';
import { useWindowStore } from '../../stores/windowStore';
import type { AppId } from '../../types';

const desktopApps: { appId: AppId; label: string }[] = [
  { appId: 'finder', label: 'Macintosh HD' },
];

export function Desktop() {
  const showDesktopIcons = useSettingsStore((s) => s.showDesktopIcons);
  const openWindow = useWindowStore((s) => s.openWindow);

  const handleDoubleClick = (appId: AppId) => {
    openWindow(appId);
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      <Wallpaper />

      {showDesktopIcons && (
        <div className="absolute top-8 right-4 flex flex-col gap-2">
          {desktopApps.map((app) => (
            <DesktopIcon
              key={app.appId}
              appId={app.appId}
              label={app.label}
              onDoubleClick={() => handleDoubleClick(app.appId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
