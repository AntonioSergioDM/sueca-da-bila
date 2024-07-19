import {
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/router';

import { Typography, CircularProgress, Button } from '@mui/material';

import type { GameState } from '@/shared/SocketTypes';

import { useSocket } from '../tools/useSocket';
import CardHolding from '../components/CardHolding';
import ShareUrlButton from '../components/ShareUrlButton';

const Lobby = () => {
  const socket = useSocket();
  const { query } = useRouter();

  const [players, setPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [isReady, setIsReady] = useState(false);

  const [gameState, setGameState] = useState<GameState | null>(null);

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

  const onGameStart = useCallback((newGameState: GameState) => {
    setGameState(newGameState);
  }, []);

  useEffect(() => {
    socket.on('playerJoined', updatePlayers);
    socket.on('gameStart', onGameStart);

    return () => {
      socket.off('playerJoined', updatePlayers);
      socket.off('gameStart', onGameStart);

      // TODO leave lobby
    };
  }, [onGameStart, socket, updatePlayers]);

  const onReady = useCallback(() => {
    setIsReady(true);

    if (players.length) {
      socket.emit('playerReady');
    }
  }, [players.length, socket]);

  return (
    <>
      <Typography>This is the game!</Typography>

      {loading && <CircularProgress />}
      {(!loading && !players.length) && <Typography>No players or error</Typography>}
      {(!loading && !!players.length) && <pre>{JSON.stringify(players, null, 2)}</pre>}

      <Button onClick={onReady} disabled={!players.length || isReady}>READY!</Button>

      {!!gameState && <CardHolding gameState={gameState} />}

      <ShareUrlButton url={urlLobby} />
    </>
  );
};

export default Lobby;
