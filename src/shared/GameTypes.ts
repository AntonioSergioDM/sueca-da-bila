import type { Card } from './Card';

export type Score = [number, number];

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

export const getPreviousPlayer = (idx: number) => {
  if (idx === 0) return 3;

  return idx - 1;
};

export const getNextPlayer = (idx: number) => {
  if (idx === 3) return 0;

  return idx + 1;
};

export enum PlayErrors {
  mustAssist = 'You must assist!',
  invalidCard = 'Invalid card',
  wrongTurn = 'Not your turn',
}

export enum DenounceErrors {
  sameTeam = "That's your teammate, you idiot",
  invalidPlayer = 'You are not a player!',
}
