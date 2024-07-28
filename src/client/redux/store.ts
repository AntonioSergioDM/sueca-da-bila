import { configureStore } from '@reduxjs/toolkit';
import { createWrapper, type Context } from 'next-redux-wrapper';
import { useDispatch, useSelector, useStore } from 'react-redux';

import { IN_DEV } from '@/globals';

import gameSlice from './gameSlice';
import chatSlice from './chatSlice';

export const makeStore = (_: Context) => (
  configureStore({
    devTools: IN_DEV,
    reducer: {
      [gameSlice.name]: gameSlice.reducer,
      [chatSlice.name]: chatSlice.reducer,
    },
  })
);

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();

export const reduxWrapper = createWrapper<AppStore>(makeStore, { debug: IN_DEV });

// REDUCERS HOOKS
export const useGameState = () => useAppSelector((state) => state.game);
export const useGameChat = () => useAppSelector((state) => state.chat);

export const useGamePlayers = () => useAppSelector((state) => state.game.players);
export const useGamePlayer = () => useAppSelector((state) => state.game.player);
export const useGameScore = () => useAppSelector((state) => state.game.score);
export const useGameTable = () => useAppSelector((state) => state.game.table);
