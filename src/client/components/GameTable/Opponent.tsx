/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-array-index-key */
import { useMemo } from 'react';

import { Typography } from '@mui/material';

import type { Card } from '@/shared/Card';

import CardImg from '../CardImg';
import FanCards from '../FanCards';

const OPPONENT_CARD_WIDTH = 100;
const OPPONENT_CARD_HEIGHT = 138;

type OpponentProps = {
  name: string;
  numCards: number;
  isPlaying: boolean;
  trumpCard: Card | null;
  position: 'top' | 'right' | 'left';
};

const Opponent = (props: OpponentProps) => {
  const {
    name,
    numCards,
    trumpCard,
    isPlaying,
    position,
  } = props;

  const cards = useMemo(() => {
    if (!numCards) return [];

    return Array(trumpCard ? numCards - 1 : numCards).fill(0);
  }, [numCards, trumpCard]);

  const { rotation, justify } = useMemo(() => {
    switch (position) {
      case 'left':
        return {
          rotation: '-90' as const,
          justify: 'justify-center',
        };
      case 'right':
        return {
          rotation: '90' as const,
          justify: 'justify-center',
        };

      case 'top':
      default:
        return {
          rotation: '0' as const,
          justify: 'justify-center',
        };
    }
  }, [position]);

  return (
    <div>
      {/* hand with fan effect */}
      <div className={`flex relative ${justify} items-center flex-row`}>
        <FanCards
          cards={cards}
          pulse={isPlaying}
          rotation={rotation}
          width={OPPONENT_CARD_WIDTH}
          height={OPPONENT_CARD_HEIGHT}
        />
      </div>

      <Typography>{name}</Typography>

      {!!trumpCard && (
        <CardImg
          card={trumpCard}
          width={OPPONENT_CARD_WIDTH}
          height={OPPONENT_CARD_HEIGHT}
        />
      )}
    </div>
  );
};

export default Opponent;
