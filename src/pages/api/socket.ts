import type { NextApiRequest, NextApiResponse } from 'next';

import { Server } from 'Socket.IO';
import type { Http2Server } from 'http2';

import type {
  SocketData,
  InterServerEvents,
  ClientToServerEvents,
  ServerToClientEvents,
} from '../../shared/server/SocketTypes';

type SocketIOResponse = NextApiResponse & {
  socket: NextApiResponse['socket'] & {
    server: Http2Server & {
      io: Server;
    };
  };
};

// let lobbies: Array<Object>;

const SocketHandler = (_: NextApiRequest, res: SocketIOResponse) => {
  console.log('🚀 ~ res.socket.server:', res.socket?.server);

  if (res.socket?.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  console.log('Socket is initializing');
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(
    res.socket!.server,
    {
      path: '/api/socket',
      addTrailingSlash: false,
    },
  );

  io.on('connection', (socket) => {
    const clientId = socket.id;
    console.log(`A client connected. ID: ${clientId}`);

    socket.on('joinLobby', (lobbyHash, playerName = '') => {
      if (playerName) {
        console.log(`${playerName} joined Lobby: ${lobbyHash}`);
      } else {
        console.log(`Joined Lobby: ${lobbyHash}`);
      }

      socket.emit('lobbyJoined');
    });
  });

  res.socket!.server.io = io;
  res.end();
};

export default SocketHandler;
