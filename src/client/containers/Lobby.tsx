import {
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/router';

import { Typography, CircularProgress, Button } from '@mui/material';

import type { GameState, PlayerState } from '@/shared/GameTypes';

import Table from '../components/Table';
import { useSocket } from '../tools/useSocket';
import PlayerHand from '../components/PlayerHand';
import ShareUrlButton from '../components/ShareUrlButton';

const Lobby = () => {
  const socket = useSocket();
  const { query } = useRouter();

  const [players, setPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [isReady, setIsReady] = useState(false);

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);

  // TODO: verify if this lobby is valid
  const urlLobby = useMemo(() => {
    if (!query?.lobby) return '';

    if (typeof query?.lobby === 'string') return query.lobby;

    return '';
  }, [query.lobby]);

  const updatePlayers = useCallback((newPlayers: Array<string>) => {
    setPlayers(newPlayers);
  }, []);

  useEffect(() => {
    if (urlLobby) {
      socket.emit('lobbyPlayers', urlLobby, (validHash, newPlayers) => {
        if (validHash) {
          updatePlayers(newPlayers);
          setLoading(false);
        } else {
          setLoading(false);
        }
      });
    }
  }, [socket, updatePlayers, urlLobby]);

  const onGameStart = useCallback((newPlayerState: PlayerState) => {
    setPlayerState(newPlayerState);
  }, []);

  const onGameChange = useCallback((newGameState: GameState) => {
    setGameState(newGameState);
  }, []);

  useEffect(() => {
    const cleanup = () => {
      socket.off('playerJoined', updatePlayers);
      socket.off('gameStart', onGameStart);
      socket.off('gameChange', onGameChange);

      socket.emit('leaveLobby');
    };

    socket.on('playerJoined', updatePlayers);
    socket.on('gameStart', onGameStart);
    socket.on('gameChange', onGameChange);
    window.addEventListener('beforeunload', cleanup);

    return () => {
      cleanup();
      window.removeEventListener('beforeunload', cleanup);
    };
  }, [onGameStart, socket, updatePlayers, onGameChange]);

  const onReady = useCallback(() => {
    setIsReady(true);

    if (players.length) {
      socket.emit('playerReady');
    }
  }, [players.length, socket]);

  return (
    <>
      {loading && <CircularProgress />}
      {(!loading && !players.length) && <Typography>No players or error</Typography>}
      {(!loading && !!players.length && !playerState) && (
        <pre>{JSON.stringify(players, null, 2)}</pre>
      )}

      {!playerState && (
        <Button onClick={onReady} disabled={!players.length || isReady}>
          READY!
        </Button>
      )}

      {(!!playerState && !!gameState) && (
        <>
          <Table playerState={playerState} gameState={gameState} players={players} />

          <PlayerHand playerState={playerState} />
        </>
      )}

      <ShareUrlButton url={urlLobby} />
    </>
  );
};

export default Lobby;
