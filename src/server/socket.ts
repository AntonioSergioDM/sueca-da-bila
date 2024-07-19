import type { NextApiRequest, NextApiResponse } from 'next';

import { Server } from 'socket.io';
import type { Http2Server } from 'http2';
import { instrument } from '@socket.io/admin-ui';

import type {
  SocketData,
  InterServerEvents,
  ClientToServerEvents,
  ServerToClientEvents,
} from '../shared/SocketTypes';
import { IN_DEV } from '../globals';

import {
  createLobby,
  joinLobby,
  lobbyPlayers,
  playCard,
  playerReady,
} from './lobbies';

type SocketIOResponse = NextApiResponse & {
  socket: NextApiResponse['socket'] & {
    server: Http2Server;
  };
};

// eslint-disable-next-line import/no-mutable-exports
export let io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null = null;

const SocketHandler = (_: NextApiRequest, res: SocketIOResponse) => {
  if (io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  console.log('Socket is initializing');
  io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
    res.socket!.server,
    {
      path: '/api/socket',
      addTrailingSlash: false,
      connectionStateRecovery: {
        // the backup duration of the sessions and the packets
        maxDisconnectionDuration: 2 * 60 * 1000,
        // whether to skip middlewares upon successful recovery
        skipMiddlewares: true,
      },
      cors: {
        // Allow any origin in dev, prod might need a fix later
        origin: IN_DEV ? true : undefined,
      },
    },
  );

  io.on('connection', (socket) => {
    if (socket.recovered) {
      // recovery was successful: socket.id, socket.rooms and socket.data were restored
      console.log(`A client reconnected. ID: ${socket.id}`);
    } else {
      // new or unrecoverable session
      console.log(`A client connected. ID: ${socket.id}`);
    }

    socket.on('joinLobby', joinLobby(socket));
    socket.on('createLobby', createLobby(socket));
    socket.on('playerReady', playerReady(socket));
    socket.on('playCard', playCard(socket));
    socket.on('lobbyPlayers', lobbyPlayers(socket));
  });

  if (IN_DEV) {
    instrument(io, {
      auth: false,
      mode: 'development',
    });
  }

  res.end();
};

export default SocketHandler;
