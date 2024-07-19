import {
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/router';

import { Typography, CircularProgress, Button } from '@mui/material';

import type { GameState, PlayerState } from '@/shared/GameTypes';

import type { LobbyPlayerState, ServerToClientEvents } from '@/shared/SocketTypes';
import type { Card } from '@/shared/Card';
import Table from '../components/Table';
import { useSocket } from '../tools/useSocket';
import PlayerHand from '../components/PlayerHand';
import ShareUrlButton from '../components/ShareUrlButton';

const Lobby = () => {
  const socket = useSocket();
  const { query } = useRouter();

  const [players, setPlayers] = useState<LobbyPlayerState[]>([]);
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

  const updatePlayers = useCallback<ServerToClientEvents['playersListUpdated']>((newPlayers) => {
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

  const onGameStart = useCallback<ServerToClientEvents['gameStart']>((newPlayerState) => {
    setPlayerState(newPlayerState);
  }, []);

  const onGameChange = useCallback<ServerToClientEvents['gameChange']>((newGameState) => {
    setGameState(newGameState);
  }, []);

  const onPlayCard = useCallback((card: Card) => {
    socket.emit('playCard', card, (newPlayerState) => {
      if (newPlayerState) setPlayerState(newPlayerState);
    });
  }, [socket]);

  useEffect(() => {
    const cleanup = () => {
      socket.off('playersListUpdated', updatePlayers);
      socket.off('gameStart', onGameStart);
      socket.off('gameChange', onGameChange);

      socket.emit('leaveLobby');
    };

    socket.on('playersListUpdated', updatePlayers);
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
        players.map((p, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <p key={`${p.name}${i}`}>
            {p.name}
            {p.ready ? '✅' : '❌'}
          </p>
        ))
      )}

      {!playerState && (
        <Button onClick={onReady} disabled={!players.length || isReady}>
          READY!
        </Button>
      )}

      {(!!playerState && !!gameState) && (
        <>
          <Table playerState={playerState} gameState={gameState} players={players} />

          <PlayerHand playerState={playerState} onPlayCard={onPlayCard} gameState={gameState} />
        </>
      )}

      <ShareUrlButton url={urlLobby} />
    </>
  );
};

export default Lobby;
