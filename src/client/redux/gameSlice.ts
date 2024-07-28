/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Card } from '@/shared/Card';
import type { LobbyPlayerState } from '@/shared/SocketTypes';
import type { PlayerState, Score, Table } from '@/shared/GameTypes';

export interface GameState {
  joined: boolean;
  gameRunning: boolean;
  table: Table;
  players: LobbyPlayerState[];
  hands: Array<number>;
  shufflePlayer: number;
  currentPlayer: number;
  trumpCard: Card | null;
  player: PlayerState | null;
  score: Score[];
}

const initialState: GameState = {
  joined: false,
  gameRunning: false,
  currentPlayer: 0,
  hands: [],
  player: null,
  players: [],
  shufflePlayer: 0,
  table: [null, null, null, null],
  trumpCard: null,
  score: [],
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    joinGame: (state: GameState, action: PayloadAction<number>) => {
      state.joined = true;
      // setting player index when joining
      state.player = { hand: [], index: action.payload };
    },
    startGame: (state: GameState) => {
      state.gameRunning = true;
    },
    setPlayers: (state: GameState, action: PayloadAction<LobbyPlayerState[]>) => {
      state.players = action.payload;
    },
    setPlayerState: (state: GameState, action: PayloadAction<PlayerState | null>) => {
      state.player = action.payload;
    },
    setCurrentPlayer: (state: GameState, action: PayloadAction<number>) => {
      state.currentPlayer = action.payload;
    },
    setHands: (state: GameState, action: PayloadAction<Array<number>>) => {
      state.hands = action.payload;
    },
    setShufflePlayer: (state: GameState, action: PayloadAction<number>) => {
      state.shufflePlayer = action.payload;
    },
    setTable: (state: GameState, action: PayloadAction<Table>) => {
      state.table = action.payload;
    },
    setTrumpCard: (state: GameState, action: PayloadAction<Card | null>) => {
      state.trumpCard = action.payload;
    },
    setScore: (state: GameState, action: PayloadAction<Score[]>) => {
      state.score = action.payload;
    },
    // resetting the game doesn't mean resetting everything
    resetGame: (state: GameState) => {
      const { joined, ...initialGameState } = initialState;

      state = {
        ...state,
        ...initialGameState,
      };
    },
    resetState: () => initialState,
  },
});

export const {
  joinGame,
  startGame,
  setPlayers,
  setPlayerState,
  setHands,
  setCurrentPlayer,
  setShufflePlayer,
  setTable,
  setTrumpCard,
  setScore,
  resetGame,
  resetState,
} = gameSlice.actions;

export default gameSlice;
