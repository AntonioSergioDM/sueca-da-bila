import type { Card } from '@/shared/Card';
import type { Table } from '@/shared/GameTypes';

import getCardId from './getCardId';

/**
 * Mirrors the server "must assist" rule (see Game.play): if the player holds a
 * card of the lead suit they may only play that suit; otherwise anything goes.
 * Returns the ids of the cards this player is allowed to play right now.
 */
const getPlayableCards = (
  hand: Card[],
  table: Table,
  currentPlayer: number,
): Set<string> => {
  const cardsOnTable = table.filter(Boolean).length;

  // Player is leading the trick — every card is fair game.
  if (cardsOnTable === 0) {
    return new Set(hand.map(getCardId));
  }

  const leadIdx = (currentPlayer - cardsOnTable + 4) % 4;
  const leadSuit = table[leadIdx]?.suit;

  if (leadSuit == null) {
    return new Set(hand.map(getCardId));
  }

  const canAssist = hand.some((card) => String(card.suit) === String(leadSuit));

  const playable = canAssist
    ? hand.filter((card) => String(card.suit) === String(leadSuit))
    : hand;

  return new Set(playable.map(getCardId));
};

export default getPlayableCards;
