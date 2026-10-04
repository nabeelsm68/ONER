'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';

export type Atmosphere = 'field' | 'control';

interface AtmosphereContextValue {
  atmosphere: Atmosphere;
  setAtmosphere: (atm: Atmosphere) => void;
  toggleAtmosphere: () => void;
  isField: boolean;
  isControl: boolean;
}

const AtmosphereContext = createContext<AtmosphereContextValue | undefined>(undefined);

function getRouteDefaultAtmosphere(pathname: string | null): Atmosphere {
  if (!pathname) return 'control';
  if (pathname.startsWith('/report') || pathname.startsWith('/community')) {
    return 'field';
  }
  // Home page uses split / dual composition, defaulting base container to control
  return 'control';
}

export function AtmosphereProvider({
  children,
  forcedAtmosphere,
}: {
  children: React.ReactNode;
  forcedAtmosphere?: Atmosphere;
}) {
  const pathname = usePathname();
  const routeDefault = useMemo(() => getRouteDefaultAtmosphere(pathname), [pathname]);

  const [atmosphere, setAtmosphere] = useState<Atmosphere>(forcedAtmosphere || routeDefault);

  // Sync atmosphere when route changes, unless overridden
  useEffect(() => {
    if (forcedAtmosphere) {
      setAtmosphere(forcedAtmosphere);
    } else {
      setAtmosphere(getRouteDefaultAtmosphere(pathname));
    }
  }, [pathname, forcedAtmosphere]);

  // Synchronize data-atmosphere on document element safely
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-atmosphere', atmosphere);
    }
  }, [atmosphere]);

  const toggleAtmosphere = () => {
    setAtmosphere((prev) => (prev === 'field' ? 'control' : 'field'));
  };

  const value = useMemo(
    () => ({
      atmosphere,
      setAtmosphere,
      toggleAtmosphere,
      isField: atmosphere === 'field',
      isControl: atmosphere === 'control',
    }),
    [atmosphere]
  );

  return (
    <AtmosphereContext.Provider value={value}>
      <div data-atmosphere={atmosphere} className="min-h-screen transition-colors duration-300">
        {children}
      </div>
    </AtmosphereContext.Provider>
  );
}

export function useAtmosphere(): AtmosphereContextValue {
  const context = useContext(AtmosphereContext);
  if (!context) {
    throw new Error('useAtmosphere must be used within an AtmosphereProvider');
  }
  return context;
}
