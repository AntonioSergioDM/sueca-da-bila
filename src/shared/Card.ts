export enum Suit {
  diamond = 1,
  spades = 2,
  hearts = 3,
  clubs = 4,
}

export const pointsOf = (card: Card) => {
  switch (card.value) {
    case 10:
      return 11;
    case 9:
      return 10;
    case 8:
      return 4;
    case 7:
      return 3;
    case 6:
      return 2;
    default:
      return 0;
  }
};

export const cardName = (card:Card) => {
  switch (card.value) {
    case 10:
      return 'Ace';
    case 9:
      return '7';
    case 8:
      return 'King';
    case 7:
      return 'Jack';
    case 6:
      return 'Queen';
    default:
      return (card.value + 1).toString;
  }
};

export type Card = {
  suit: Suit | `${Suit}`;
  value: number;
};
