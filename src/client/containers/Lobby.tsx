import {
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/router';

import {
  Box,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';
import { CopyAll } from '@mui/icons-material';

import { SiteRoute } from '@/shared/Routes';

import { useSocket } from '../tools/useSocket';

const Lobby = () => {
  const socket = useSocket();
  const { query } = useRouter();

  const [loading, setLoading] = useState(true);
  const [playerNames, setPlayerNames] = useState<string[]>([]);

  // TODO: verify if this lobby is valid
  const urlLobby = useMemo(() => {
    if (!query?.lobby) return '';

    if (typeof query?.lobby === 'string') return query.lobby;

    return '';
  }, [query.lobby]);

  useEffect(() => {
    if (urlLobby) {
      socket.emit('lobbyPlayers', urlLobby, (validHash, players) => {
        if (validHash) {
          setPlayerNames(players);
          setLoading(false);
        } else {
          setLoading(false);
        }
      });
    }
  }, [socket, urlLobby]);

  const updatePlayers = (players: Array<string>) => {
    setPlayerNames(players);
  };

  useEffect(() => {
    socket.on('playerJoined', updatePlayers);

    return () => {
      socket.off('playerJoined', updatePlayers);
      // TODO leave lobby
    };
  }, [socket]);

  const shareURL = useMemo(() => (
    `${process.env.NEXT_PUBLIC_URL}${SiteRoute.JoinLobby}/${urlLobby}`
  ), [urlLobby]);

  const onCopy = useCallback(async () => {
    await navigator.clipboard.writeText(shareURL);
  }, [shareURL]);

  return (
    <>
      <Typography>This is the game!</Typography>

      {loading && <CircularProgress />}
      {(!loading && !playerNames.length) && <Typography>No players or error</Typography>}
      {(!loading && !!playerNames.length) && <pre>{JSON.stringify(playerNames, null, 2)}</pre>}

      <Box
        component="div"
        sx={{
          display: 'flex',
          p: 1,
          gap: 1,
          alignItems: 'center',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#101010' : '#fff'),
          color: (theme) => (theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800'),
          border: '1px solid',
          borderColor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300'),
          borderRadius: 2,
          fontSize: '0.875rem',
          fontWeight: '700',
        }}
      >
        Share link

        <IconButton onClick={onCopy}><CopyAll /></IconButton>
      </Box>
    </>
  );
};

export default Lobby;
