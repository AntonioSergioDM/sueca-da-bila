import { useMemo } from 'react';

import type { Card } from '@/shared/Card';
import { SMALL_CARD } from '@/client/components/AnimatedCard';

import PlayerHand from './PlayerHand';

type RightPlayerProps = {
  cardNum: number;
  isRgb?: boolean;
  isPlaying?: boolean;
  trumpCard: Card | null;
  name: string;
  cardWidth?: number;
};

const RightPlayer = (props: RightPlayerProps) => {
  const {
    isRgb,
    cardNum,
    isPlaying,
    trumpCard,
    name,
    cardWidth = SMALL_CARD,
  } = props;

  const emptyCards = useMemo(() => {
    if (!cardNum) return []; // or the only card available to this player is the trump card

    return Array(trumpCard ? cardNum - 1 : cardNum).fill(0);
  }, [cardNum, trumpCard]);

  return (
    <div
      className="fixed top-1/2 right-0 flex row justify-center -rotate-90"
    >
      <PlayerHand
        isRgb={isRgb}
        cardWidth={cardWidth}
        cards={emptyCards}
        trumpCard={trumpCard}
        isPlaying={isPlaying}
        name={name}
      />
    </div>
  );
};

export default RightPlayer;
