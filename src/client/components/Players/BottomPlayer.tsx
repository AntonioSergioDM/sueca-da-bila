/* eslint-disable @next/next/no-img-element */
import { useMemo } from 'react';

import type { Card } from '@/shared/Card';
import getCardId from '@/client/tools/getCardId';
import { BIG_CARD } from '@/client/components/AnimatedCard';

import PlayerHand from './PlayerHand';

type BottomPlayerProps = {
  cards: Card[];
  isRgb?: boolean;
  isPlaying?: boolean;
  trumpCard: Card | null;
  name: string;
  cardWidth?: number;
  canHideTrump?: boolean;
  playableCards?: Set<string>;
  onPlayCard: (card: Card) => void;
  onHideTrump?: () => void;
};

const BottomPlayer = (props: BottomPlayerProps) => {
  const {
    cards,
    isRgb,
    trumpCard,
    isPlaying,
    name,
    cardWidth = BIG_CARD,
    canHideTrump,
    playableCards,
    onPlayCard,
    onHideTrump,
  } = props;

  const cardsInHand = useMemo(() => {
    if (!cards.length) return []; // or the only card available to this player is the trump card

    if (!trumpCard) return cards;

    return cards.filter((card) => getCardId(card) !== getCardId(trumpCard));
  }, [cards, trumpCard]);

  return (
    <div className="fixed bottom-0 left-1/2 flex row justify-center">
      <PlayerHand
        isPlayer
        isRgb={isRgb}
        cards={cardsInHand}
        cardWidth={cardWidth}
        trumpCard={trumpCard}
        isPlaying={isPlaying}
        canHideTrump={canHideTrump}
        playableCards={playableCards}
        onClick={onPlayCard}
        onHideTrump={onHideTrump}
        name={name}
      />
    </div>
  );
};

export default BottomPlayer;
