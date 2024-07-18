import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Button, TextField } from '@mui/material';
import { io, Socket } from 'socket.io-client';
import { ClientMessages } from '../shared/client/ClientMessages';

let socket:Socket;


export default function Home() {
  const [lobbyHash, setLobbyHash] = React.useState('');

  React.useEffect(() => {
    if (!socket){
    socketInitializer();
  }
  }, [])

  const socketInitializer = async () => {
    await fetch('/api/socket');
    socket = io();

    socket.on('connect', () => {
      console.log('connected');
    })
  }

  const onPing = () => {
    console.log('Trying to ping...');
    
    socket.emit(ClientMessages.joinLobby, lobbyHash);
    
    console.log('Did it ping?');
  }

  return (
    <Container maxWidth="lg">
      <Typography>Hello there!</Typography>
      <TextField value={lobbyHash} onChange={(event)=>{setLobbyHash(event.target.value)}}></TextField>
      <Button onClick={onPing}>Ping</Button>
    </Container>
  );
}

