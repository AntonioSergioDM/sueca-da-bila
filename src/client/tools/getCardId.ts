import { cardName, type Card, Suit } from '@/shared/Card';

const getCardId = (card: Card) => {
  const suitStr = Suit[card.suit];
  const valueStr = cardName(card);

  return `${suitStr}${valueStr}`;
};

export default getCardId;
