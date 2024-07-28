/* eslint-disable @next/next/no-img-element */
import { useMemo } from 'react';

import type { Card } from '@/shared/Card';
import getCardId from '@/client/tools/getCardId';
import { useGamePlayer } from '@/client/redux/store';
import { BIG_CARD } from '@/client/components/AnimatedCard';

import PlayerHand from './PlayerHand';

type BottomPlayerProps = {
  isRgb?: boolean;
  isPlaying?: boolean;
  trumpCard: Card | null;
  onPlayCard: (card: Card) => void;
};

const BottomPlayer = (props: BottomPlayerProps) => {
  const {
    isRgb,
    trumpCard,
    isPlaying,
    onPlayCard,
  } = props;

  const { hand } = useGamePlayer()!;

  const cardsInHand = useMemo(() => {
    if (!hand.length) return []; // or the only card available to this player is the trump card

    if (!trumpCard) return hand;

    return hand.filter((card) => getCardId(card) !== getCardId(trumpCard));
  }, [hand, trumpCard]);

  return (
    <div className="fixed bottom-0 left-1/2 flex row justify-center">
      <PlayerHand
        isPlayer
        isRgb={isRgb}
        cards={cardsInHand}
        cardWidth={BIG_CARD}
        trumpCard={trumpCard}
        isPlaying={isPlaying}
        onClick={onPlayCard}
      />
    </div>
  );
};

export default BottomPlayer;
