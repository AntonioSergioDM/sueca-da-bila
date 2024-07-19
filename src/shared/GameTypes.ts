import type { Card } from './Card';

export type Table = [Card | null, Card | null, Card | null, Card | null];

export type Hand = Array<Card>;

export type PlayerState = {
  index: number;
  hand: Hand;
};

export type GameState = {
  hands: Array<number>;
  table: Table;
  trumpCard: Card | null;
  shufflePlayer: number;
  currentPlayer: number;
};
