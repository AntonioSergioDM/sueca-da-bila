import {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useRouter } from 'next/router';

import { Typography, CircularProgress, Button } from '@mui/material';

import type { GameState, Hand } from '@/shared/GameTypes';

import { useSocket } from '../tools/useSocket';
import CardHolding from '../components/CardHolding';
import ShareUrlButton from '../components/ShareUrlButton';

const Lobby = () => {
  const socket = useSocket();
  const { query } = useRouter();
  const mountedRef = useRef(false);

  const [players, setPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [isReady, setIsReady] = useState(false);

  const [myHand, setHand] = useState<Hand>([]);

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

  const onGameStart = useCallback((hand: Hand) => {
    console.log(hand);

    setHand(hand);
  }, []);

  const onGameChange = useCallback((newGameState: GameState) => {
    console.log(newGameState);

    // TODO show it
  }, []);

  useEffect(() => {
    if (!mountedRef.current) {
      socket.on('playerJoined', updatePlayers);
      socket.on('gameStart', onGameStart);
      socket.on('gameChange', onGameChange);

      mountedRef.current = true;
    }

    return () => {
      if (!mountedRef) {
        socket.off('playerJoined', updatePlayers);
        socket.off('gameStart', onGameStart);
        socket.off('gameChange', onGameChange);

        socket.emit('leaveLobby');
      }
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
      <Typography>This is the game!</Typography>

      {loading && <CircularProgress />}
      {(!loading && !players.length) && <Typography>No players or error</Typography>}
      {(!loading && !!players.length) && <pre>{JSON.stringify(players, null, 2)}</pre>}

      <Button onClick={onReady} disabled={!players.length || isReady}>READY!</Button>

      {!!myHand.length && <CardHolding hand={myHand} />}

      <ShareUrlButton url={urlLobby} />
    </>
  );
};

export default Lobby;
