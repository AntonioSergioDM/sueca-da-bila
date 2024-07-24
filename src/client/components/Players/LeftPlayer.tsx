/* eslint-disable @next/next/no-img-element */
import { useMemo } from 'react';

import type { Card } from '@/shared/Card';
import { SMALL_CARD } from '@/client/components/AnimatedCard';

import PlayerHand from './PlayerHand';

type LeftPlayerProps = {
  cardNum: number;
  isRgb?: boolean;
  isPlaying?: boolean;
  trumpCard: Card | null;
};

const LeftPlayer = (props: LeftPlayerProps) => {
  const {
    isRgb,
    cardNum,
    isPlaying,
    trumpCard,
  } = props;

  const emptyCards = useMemo(() => {
    if (!cardNum) return []; // or the only card available to this player is the trump card

    return Array(trumpCard ? cardNum - 1 : cardNum).fill(0);
  }, [cardNum, trumpCard]);

  return (
    <div className="fixed top-1/2 left-0 flex row justify-center rotate-90">
      <PlayerHand
        isRgb={isRgb}
        cardWidth={SMALL_CARD}
        cards={emptyCards}
        trumpCard={trumpCard}
        isPlaying={isPlaying}
      />
    </div>
  );
};

export default LeftPlayer;
