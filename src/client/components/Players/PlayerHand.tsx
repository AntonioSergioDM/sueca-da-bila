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
  onClick?: (card: Card) => void;
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
    onClick,
  } = props;

  const handleOnClick = useCallback((card: Card | 0) => () => {
    if (isPlayer && isPlaying && card && onClick) onClick(card);
  }, [isPlayer, isPlaying, onClick]);

  return (
    <AnimatePresence>
      {!!trumpCard && (
        <motion.div
          animate={{ x: `${cards.length <= 2 ? 125 : (25 * cards.length)}%`, y: '65%' }}
          className="absolute bottom-0 select-none"
          onClick={(isPlayer && handleOnClick(trumpCard)) || undefined}
        >
          <AnimatedCard
            rgb={isRgb}
            pulse={isPlaying}
            width={cardWidth}
            card={trumpCard}
            clickable={isPlayer && isPlaying}
          />
        </motion.div>
      )}

      <Typography>{name}</Typography>

      {cards.map((card, idx) => (
        <motion.div
          // eslint-disable-next-line react/no-array-index-key
          key={idx}
          initial="fromDeck"
          animate="inHand"
          variants={getCardFanVariants(idx, cards.length)}
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
