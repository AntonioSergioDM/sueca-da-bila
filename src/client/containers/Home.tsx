import {
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';

import { io, type Socket } from 'socket.io-client';

import {
  Stack,
  Button,
  TextField,
  Typography,
} from '@mui/material';

import type { ClientToServerEvents, ServerToClientEvents } from '../../shared/SocketTypes';

let socket: Socket<ServerToClientEvents, ClientToServerEvents>;
let userId: string = '';

const Home = () => {
  // two ways of setting input values
  const playerNameRef = useRef<HTMLInputElement>();
  const [lobbyHash, setLobbyHash] = useState('');

  useEffect(() => {
    const socketInitializer = () => {
      if (socket) { return; }

      socket = io({ path: '/api/socket', autoConnect: false });

      socket.on('connect', () => {
        console.log('connected');
      });

      socket.on('lobbyJoined', () => {
        alert('lobbyJoined');
      });

      socket.connect();
    };

    socketInitializer();
  }, []);

  const onJoin = useCallback(() => {
    console.log('Trying to join...');

    console.log('🚀 ~ lobbyHash:', lobbyHash);
    socket.emit('joinLobby', lobbyHash, playerNameRef.current?.value || '', (hash, playerId) => {
      userId = playerId;

      setLobbyHash(hash);

      console.log('Hash: ' + hash);
      console.log('Player Id: ' + playerId);

    });
  }, [lobbyHash]);

  return (
    <Stack
      gap={2}
      useFlexGap
      maxWidth="sm"
      margin="16px auto"
      direction="column"
      justifyContent="center"
      alignItems={{ md: 'center', lg: 'center', xl: 'center' }}
    >
      <Typography>Hello there!</Typography>

      <TextField
        fullWidth
        label="Lobby hash"
        value={lobbyHash}
        onChange={(event) => { setLobbyHash(event.target.value); }}
      />

      <TextField
        fullWidth
        label="Player Name"
        inputRef={playerNameRef}
      />

      <Button variant="contained" onClick={onJoin}>Join</Button>
    </Stack>
  );
};

export default Home;
