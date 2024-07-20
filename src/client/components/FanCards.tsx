/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-array-index-key */
import { useCallback } from 'react';

import { Box } from '@mui/material';

import type { Card } from '@/shared/Card';

import CardImg from './CardImg';

type FanCardsProps = {
  cards: (Card | null)[];
  /** Card width */
  width: number;
  /** Card height */
  height: number;
  /** Whether the cards are pulsing or not */
  pulse?: boolean;
  /** Rotate the entire hand. Default 0 */
  rotation?: '90' | '-90' | '0';
  /** Only used for the player */
  onPlayCard?: (card: Card) => void;
  /** Whether the cards have the hover effect */
  hoverable?: boolean;
};

/** Use this to fan an array of cards. Parent must be 'position: relative' */
const FanCards = (props: FanCardsProps) => {
  const {
    cards,
    width,
    pulse,
    height,
    onPlayCard,
    rotation = '0',
    hoverable = false,
  } = props;

  const handleOnPlayCard = useCallback((card: Card) => () => {
    if (onPlayCard) {
      onPlayCard(card);
    }
  }, [onPlayCard]);

  return cards.map((card, idx) => (
    <Box
      key={idx}
      onClick={card && onPlayCard ? handleOnPlayCard(card) : undefined}
      draggable={false}
      sx={{
        overflow: 'hidden',
        position: 'absolute',
        userSelect: 'none',

        '--idx': idx,
        '--angle': '100deg',
        '--numCards': cards.length,

        width,
        height,
        borderWidth: 2,
        borderRadius: '4px',
        borderColor: 'black',
        borderStyle: 'solid',

        transformOrigin: 'center 130%',
        transform: `translate(0%, 50%) rotate(calc(((var(--angle) / 2) * -1 + var(--angle) / var(--numCards) * var(--idx)) + ${rotation}deg))`,
        animation: pulse ? 'pulse 1s infinite alternate' : 'none',

        ...(hoverable ? {
          ':hover': {
            cursor: 'pointer',
            scale: '110%',
          },
        } : {}),

        '@keyframes pulse': {
          from: { borderColor: 'black' },
          to: { borderColor: 'gold' },
        },
      }}
    >
      <CardImg
        card={card}
        width={width}
        height={height}
      />
    </Box>
  ));
};

export default FanCards;
