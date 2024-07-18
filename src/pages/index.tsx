import { useCallback, useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Button, TextField } from '@mui/material';
import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from '../shared/server/SocketTypes';

let socket: Socket<ServerToClientEvents, ClientToServerEvents>;

export default function Home() {
  const [lobbyHash, setLobbyHash] = useState('');

  useEffect(() => {
    socketInitializer();
  }, []);

  const socketInitializer = useCallback(async () => {
    if (socket) { return; }

    console.log("🚀 ~ socketInitializer ~ socketInitializer:");
    socket = io({ path: '/api/socket', autoConnect: false });

    socket.on('connect', () => {
      console.log('connected');
    });

    socket.on('lobbyJoined', () => {
      alert('lobbyJoined');
    });

    socket.connect();
  }, []);

  const onPing = useCallback(() => {
    console.log('Trying to ping...');

    console.log("🚀 ~ onPing ~ lobbyHash:", lobbyHash)
    socket.emit('joinLobby', lobbyHash);

    console.log('Did it ping?');
  }, [lobbyHash]);

  return (
    <Container maxWidth="lg">
      <Typography>Hello there!</Typography>
      <TextField value={lobbyHash} onChange={(event) => { setLobbyHash(event.target.value) }}></TextField>
      <Button onClick={onPing}>Ping</Button>
    </Container>
  );
}

