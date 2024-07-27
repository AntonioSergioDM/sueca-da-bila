import {
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';

import type { Card } from '@/shared/Card';
import type { GameState, PlayerState } from '@/shared/GameTypes';
import type { LobbyPlayerState, ServerToClientEvents } from '@/shared/SocketTypes';

import { useSocket } from '../tools/useSocket';
import LobbyRoom from '../components/LobbyRoom';
import FramerGame from '../components/FramerGame';

const Game = () => {
  const { enqueueSnackbar } = useSnackbar();

  const socket = useSocket();
  const { query } = useRouter();

  const [players, setPlayers] = useState<LobbyPlayerState[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);

  const lobbyHash = useMemo(() => {
    if (!query?.lobby) return '';

    if (typeof query?.lobby === 'string') return query.lobby;

    return '';
  }, [query.lobby]);

  const updatePlayers = useCallback<ServerToClientEvents['playersListUpdated']>((newPlayers) => {
    setPlayers(newPlayers);
  }, []);

  const onGameChange = useCallback<ServerToClientEvents['gameChange']>((newGameState) => {
    setGameState(newGameState);
  }, []);

  useEffect(() => {
    if (lobbyHash) {
      // get current players in lobby
      socket.emit('lobbyPlayers', lobbyHash, (validHash, newPlayers) => {
        if (validHash) {
          updatePlayers(newPlayers);
        }
      });
    }
  }, [socket, updatePlayers, lobbyHash]);

  const onGameReset = useCallback<ServerToClientEvents['gameReset']>(() => {
    setGameState(null);
    setPlayerState(null);
  }, []);

  const onGameStart = useCallback<ServerToClientEvents['gameStart']>((newPlayerState) => {
    setPlayerState(newPlayerState);
  }, []);

  const onPlayCard = useCallback((card: Card) => {
    socket.emit('playCard', card, (res) => {
      if (typeof res.error === 'string') {
        enqueueSnackbar({
          variant: 'error',
          message: res.error,
        });
      } else {
        setPlayerState(res.data);
      }
    });
  }, [enqueueSnackbar, socket]);

  useEffect(() => {
    const cleanup = () => {
      socket.off('playersListUpdated', updatePlayers);
      socket.off('gameStart', onGameStart);
      socket.off('gameChange', onGameChange);
      socket.off('gameReset', onGameReset);

      socket.emit('leaveLobby');
    };

    socket.on('playersListUpdated', updatePlayers);
    socket.on('gameStart', onGameStart);
    socket.on('gameChange', onGameChange);
    socket.on('gameReset', onGameReset);

    // cleanup when browser/tab closes
    window.addEventListener('beforeunload', cleanup);

    return () => {
      cleanup();
      window.removeEventListener('beforeunload', cleanup);
    };
  }, [onGameChange, onGameReset, onGameStart, socket, updatePlayers]);

  return (
    <>
      {!playerState && (
        <LobbyRoom
          players={players}
          playerIdx={0} // TODO: well how about this? we need the idx before the game starts
          lobbyHash={lobbyHash}
        />
      )}

      {(!!playerState && !!gameState && players.length >= 4) && (
        <FramerGame
          players={players}
          gameState={gameState}
          onPlayCard={onPlayCard}
          playerState={playerState}
        />
      )}
    </>
  );
};

export default Game;
