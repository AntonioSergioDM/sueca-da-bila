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

import type { ClientToServerEvents, ServerToClientEvents } from '../shared/server/SocketTypes';

let socket: Socket<ServerToClientEvents, ClientToServerEvents>;

const Home = () => {
  // two ways of setting input values
  const playerNameRef = useRef<HTMLInputElement>();
  const [lobbyHash, setLobbyHash] = useState('');

  useEffect(() => {
    const socketInitializer = () => {
      if (socket) { return; }

      console.log('🚀 ~ socketInitializer ~ socketInitializer:');
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

  const onPing = useCallback(() => {
    console.log('Trying to ping...');

    console.log('🚀 ~ onPing ~ lobbyHash:', lobbyHash);
    socket.emit('joinLobby', lobbyHash, playerNameRef.current?.value);

    console.log('Did it ping?');
  }, [lobbyHash]);

  return (
    <Stack maxWidth="lg" direction="column" gap={2} margin={2}>
      <Typography>Hello there!</Typography>

      <TextField
        label="Lobby hash"
        value={lobbyHash}
        onChange={(event) => { setLobbyHash(event.target.value); }}
      />
      <TextField
        label="Player Name"
        inputRef={playerNameRef}
      />

      <Button onClick={onPing}>Ping</Button>
    </Stack>
  );
};

export default Home;
