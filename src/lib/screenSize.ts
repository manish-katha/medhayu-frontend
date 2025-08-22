'use client';

import { useState, useEffect } from 'react';

const breakpoints = {
  mobile: 640,
  tablet: 1024,
};

type ScreenSize = 'mobile' | 'tablet' | 'desktop';

export function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < breakpoints.mobile) {
        setScreenSize('mobile');
      } else if (window.innerWidth < breakpoints.tablet) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
}
