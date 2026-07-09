import type { Variants } from 'framer-motion';

import { BIG_CARD } from '../AnimatedCard';

const CARD_CLOSENESS = 25;
const MAX_BUMP = 20; // Max y-position bump
const MAX_ROTATION = 65; // Max rotation angle
const PLAYABLE_LIFT = 25; // Extra raise for a card that can be played this turn

/**
 * `cardWidth` is the (possibly viewport-scaled) width of a card. The fan spacing
 * and vertical bump are derived from it so that when cards shrink on small
 * screens the whole hand tightens proportionally instead of leaving gaps or
 * overflowing.
 */
const getCardFanVariants = (
  idx: number,
  numCards: number,
  cardWidth: number = BIG_CARD,
  lift = false,
): Variants => {
  const scale = cardWidth / BIG_CARD;
  const closeness = CARD_CLOSENESS * scale;
  const maxBump = MAX_BUMP * scale;

  const offset = ((numCards - 1) * closeness) / 2;
  const xPosition = idx * closeness - offset;
  const bump = numCards > 1 ? (1 - Math.abs(idx - (numCards - 1) / 2) / ((numCards - 1) / 2)) * maxBump : 0;
  const yPosition = bump + (lift ? PLAYABLE_LIFT * scale : 0);

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
