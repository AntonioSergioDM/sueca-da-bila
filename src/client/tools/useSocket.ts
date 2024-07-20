import { useMemo } from 'react';
import { io, type Socket } from 'socket.io-client';

import type { ClientToServerEvents, ServerToClientEvents } from '@/shared/SocketTypes';

let socket: Socket<ServerToClientEvents, ClientToServerEvents>;

const getSocket = () => {
  if (socket) { return socket; }
  console.log('Initializing socket');

  socket = io({ path: '/api/socket', autoConnect: false });

  socket.on('connect', () => {
    console.log('connected');
  });

  socket.connect();

  return socket;
};

export const useSocket = () => (
  useMemo(() => getSocket(), [])
);
