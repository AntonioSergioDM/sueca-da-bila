import { useEffect, useState } from 'react';

/**
 * The board layout was tuned for a roughly desktop-sized viewport. These are the
 * dimensions where cards should render at their full, unscaled size.
 */
const BASELINE_WIDTH = 560;
const BASELINE_HEIGHT = 620;

/**
 * How far past the tuned baseline the board may grow on roomy (desktop)
 * viewports. Still bounded by the axis ratios below, so it never overflows.
 */
const MAX_SCALE = 1.3;

const computeScale = () => {
  if (typeof window === 'undefined') {
    return 1;
  }

  const byWidth = window.innerWidth / BASELINE_WIDTH;
  const byHeight = window.innerHeight / BASELINE_HEIGHT;

  // Grow up to MAX_SCALE on big screens; shrink to whichever axis is tightest.
  return Math.min(MAX_SCALE, byWidth, byHeight);
};

/**
 * Returns a 0-1 multiplier for card sizing so the whole board (four hands + the
 * table) fits within small/mobile viewports instead of overflowing off-screen.
 */
export const useCardScale = (): number => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => setScale(computeScale());

    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return scale;
};

export default useCardScale;
