import { useWindowStore } from '../../stores/windowStore';
import { useDockStore } from '../../stores/dockStore';
import { Window } from './Window';
import { lazy, Suspense, useEffect, type LazyExoticComponent, type ComponentType } from 'react';
import type { AppId } from '../../types';

// Lazy load all apps
const Finder = lazy(() => import('../../apps/Finder/Finder'));
const Terminal = lazy(() => import('../../apps/Terminal/Terminal'));
const Notes = lazy(() => import('../../apps/Notes/Notes'));
const Calculator = lazy(() => import('../../apps/Calculator/Calculator'));
const Settings = lazy(() => import('../../apps/Settings/Settings'));
const Safari = lazy(() => import('../../apps/Safari/Safari'));
const Music = lazy(() => import('../../apps/Music/Music'));
const Photos = lazy(() => import('../../apps/Photos/Photos'));
const Snake = lazy(() => import('../../apps/Snake/Snake'));

const appComponents: Record<string, LazyExoticComponent<ComponentType>> = {
  Finder,
  Terminal,
  Notes,
  Calculator,
  Settings,
  Safari,
  Music,
  Photos,
  Snake,
};

function WindowLoader() {
  return (
    <div className="flex items-center justify-center h-full bg-[#2d2d2d]">
      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  );
}

export function WindowManager() {
  const windows = useWindowStore((s) => s.windows);
  const addWindowToApp = useDockStore((s) => s.addWindowToApp);
  const removeWindowFromApp = useDockStore((s) => s.removeWindowFromApp);

  // Sync window state with dock
  useEffect(() => {
    const windowsByApp = windows.reduce((acc, win) => {
      const appId = win.appId as AppId;
      if (!acc[appId]) acc[appId] = [];
      acc[appId].push(win.id);
      return acc;
    }, {} as Record<AppId, string[]>);

    // Update dock for each app
    Object.entries(windowsByApp).forEach(([appId, windowIds]) => {
      windowIds.forEach((windowId) => {
        addWindowToApp(appId as AppId, windowId);
      });
    });
  }, [windows, addWindowToApp, removeWindowFromApp]);

  return (
    <>
      {windows.map((win) => {
        const AppComponent = appComponents[win.component];
        if (!AppComponent) return null;

        return (
          <Window key={win.id} window={win}>
            <Suspense fallback={<WindowLoader />}>
              <AppComponent />
            </Suspense>
          </Window>
        );
      })}
    </>
  );
}
