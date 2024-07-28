import { useCallback, useEffect } from 'react';

import { useSnackbar } from 'notistack';

import type { ServerToClientEvents } from '@/shared/SocketTypes';

import {
  setScore,
  setHands,
  setTable,
  resetGame,
  startGame,
  resetState,
  setPlayers,
  setTrumpCard,
  setPlayerState,
  setCurrentPlayer,
  setShufflePlayer,
} from '../redux/gameSlice';
import { useAppDispatch, useGameState, useGamePlayer } from '../redux/store';

import { useSocket } from './useSocket';

export const useGameListeners = (lobbyHash: string) => {
  const socket = useSocket();
  const player = useGamePlayer();
  const { joined } = useGameState();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const onPlayerListUpdate = useCallback<ServerToClientEvents['playersListUpdated']>((newPlayerList) => {
    dispatch(setPlayers(newPlayerList));
  }, [dispatch]);

  const onGameStart = useCallback<ServerToClientEvents['gameStart']>((newPlayerState) => {
    dispatch(setPlayerState(newPlayerState));
    dispatch(startGame());
  }, [dispatch]);

  const onGameChange = useCallback<ServerToClientEvents['gameChange']>((newGameState) => {
    dispatch(setCurrentPlayer(newGameState.currentPlayer));
    dispatch(setHands(newGameState.hands));
    dispatch(setShufflePlayer(newGameState.shufflePlayer));
    dispatch(setTable(newGameState.table));
    dispatch(setTrumpCard(newGameState.trumpCard));
  }, [dispatch]);

  const onGameReset = useCallback<ServerToClientEvents['gameReset']>(() => {
    dispatch(resetGame());
  }, [dispatch]);

  const onResetState = useCallback(() => {
    dispatch(resetState());
  }, [dispatch]);

  useEffect(() => {
    const cleanup = () => {
      socket.off('playersListUpdated', onPlayerListUpdate);
      socket.off('gameStart', onGameStart);
      socket.off('gameChange', onGameChange);
      socket.off('gameReset', onGameReset);

      socket.emit('leaveLobby');
      onResetState();
    };

    socket.on('playersListUpdated', onPlayerListUpdate);
    socket.on('gameStart', onGameStart);
    socket.on('gameChange', onGameChange);
    socket.on('gameReset', onGameReset);

    // cleanup when browser/tab closes
    window.addEventListener('beforeunload', cleanup);

    return () => {
      cleanup();
      window.removeEventListener('beforeunload', cleanup);
    };
  }, [onGameChange, onGameReset, onGameStart, onPlayerListUpdate, onResetState, socket]);

  const onGameResults = useCallback<ServerToClientEvents['gameResults']>((score) => {
    if (!score.length) return;

    if (!player) return;

    dispatch(setScore(score));

    const myTeam = player.index % 2;
    const result = score[score.length - 1] || [0, 0];

    enqueueSnackbar({
      variant: 'info',
      message: `Game ended: You ${result[myTeam] > result[myTeam ? 0 : 1] ? 'won' : 'lost'}! Points: ${result[myTeam]}`,
    });
  }, [dispatch, enqueueSnackbar, player]);

  // different useEffect, 'onGameResults' has different dependencies
  useEffect(() => {
    socket.on('gameResults', onGameResults);

    return () => {
      socket.off('gameResults', onGameResults);
    };
  }, [onGameResults, socket]);

  useEffect(() => {
    if (lobbyHash && joined) {
      // get current players in lobby
      socket.emit('lobbyPlayers', lobbyHash, (validHash, newPlayers) => {
        if (validHash) {
          onPlayerListUpdate(newPlayers);
        }
      });
    }
  }, [joined, lobbyHash, onPlayerListUpdate, socket]);
};
