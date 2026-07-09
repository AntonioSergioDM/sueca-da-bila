import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Typography } from '@mui/material';
import type { Card } from '@/shared/Card';

import AnimatedCard from '../AnimatedCard';

import getCardFanVariants from './getCardFanVariants';

type PlayerHandProps = {
  isRgb?: boolean;
  cardWidth: number;
  isPlayer?: boolean;
  cards: (Card | 0)[];
  isPlaying?: boolean;
  trumpCard: Card | null;
  name: string;
  canHideTrump?: boolean;
  onClick?: (card: Card) => void;
  onHideTrump?: () => void;
};

const PlayerHand = (props: PlayerHandProps) => {
  const {
    cards,
    isRgb,
    cardWidth,
    trumpCard,
    isPlaying,
    isPlayer,
    name,
    canHideTrump,
    onClick,
    onHideTrump,
  } = props;

  const handleOnClick = useCallback((card: Card | 0) => () => {
    if (isPlayer && isPlaying && card && onClick) onClick(card);
  }, [isPlayer, isPlaying, onClick]);

  // On your turn the trump is played; otherwise (after the first round) it can be picked up.
  const handleTrumpClick = useCallback((card: Card) => {
    if (!isPlayer) return undefined;
    if (isPlaying) return handleOnClick(card);
    if (canHideTrump && onHideTrump) return onHideTrump;
    return undefined;
  }, [isPlayer, isPlaying, canHideTrump, onHideTrump, handleOnClick]);

  return (
    <AnimatePresence>
      {!!trumpCard && (
        <motion.div
          animate={{ x: `-${cards.length <= 2 ? 125 : (25 * cards.length)}%`, y: '65%' }}
          className="absolute bottom-0 select-none"
          onClick={handleTrumpClick(trumpCard)}
        >
          <AnimatedCard
            rgb={isRgb}
            pulse={isPlaying}
            width={cardWidth}
            card={trumpCard}
            clickable={isPlayer && (isPlaying || canHideTrump)}
          />
        </motion.div>
      )}

      <Typography className="relative z-20 px-1 rounded bg-black/40 [text-shadow:_0_1px_2px_rgb(0_0_0_/_80%)]">{name}</Typography>

      {cards.map((card, idx) => (
        <motion.div
          // eslint-disable-next-line react/no-array-index-key
          key={idx}
          initial="fromDeck"
          animate="inHand"
          variants={getCardFanVariants(idx, cards.length, cardWidth)}
          className="absolute bottom-0 select-none"
          onClick={(isPlayer && handleOnClick(card)) || undefined}
        >
          <AnimatedCard
            rgb={isRgb}
            pulse={isPlaying}
            width={cardWidth}
            card={card || null}
            clickable={isPlayer && isPlaying}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  );
};

export default PlayerHand;
