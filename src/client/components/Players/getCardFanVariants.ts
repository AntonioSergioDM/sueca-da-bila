import type { Variants } from 'framer-motion';

const CARD_CLOSENESS = 25;
const MAX_BUMP = 20; // Max y-position bump
const MAX_ROTATION = 65; // Max rotation angle

const getCardFanVariants = (idx: number, numCards: number): Variants => {
  const offset = ((numCards - 1) * CARD_CLOSENESS) / 2;
  const xPosition = idx * CARD_CLOSENESS - offset;
  const yPosition = numCards > 1 ? (1 - Math.abs(idx - (numCards - 1) / 2) / ((numCards - 1) / 2)) * MAX_BUMP : 0;

  const maxRotation = numCards > 3 ? MAX_ROTATION : 20;
  const rotation = numCards > 1 ? (idx - (numCards - 1) / 2) * (maxRotation / (numCards - 1)) : 0;

  return {
    fromDeck: {
      x: 999,
      y: 0,
      rotate: 180,
    },
    inHand: {
      x: xPosition,
      y: -yPosition,
      rotate: rotation,
      transition: {
        x: { type: 'spring', damping: 15 },
        y: { type: 'spring', damping: 15 },
        rotate: { duration: 0.5, type: 'tween' },
      },
    },
  };
};

export default getCardFanVariants;
