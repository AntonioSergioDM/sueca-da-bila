/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import type { Card } from '@/shared/Card';
import type { PlayerState, Table } from '@/shared/GameTypes';

export type Player = {
  idx: number;
  name: string;
  ready: boolean;
};

export interface GameState {
  table: Table;
  players: Player[];
  hands: Array<number>;
  shufflePlayer: number;
  currentPlayer: number;
  trumpCard: Card | null;
  player: PlayerState;
}

const initialState: GameState = {
  currentPlayer: 0,
  hands: [],
  player: { hand: [], index: 0 },
  players: [],
  shufflePlayer: 0,
  table: [null, null, null, null],
  trumpCard: null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {},
});

// export const {
//   reducers here
// } = gameSlice.actions;

export default gameSlice;
