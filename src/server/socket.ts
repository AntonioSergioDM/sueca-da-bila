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
  denounce,
  joinLobby,
  leaveLobby,
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
    console.info('Socket is already running');
    res.end();
    return;
  }

  console.info('Socket is initializing');
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
      if (IN_DEV) {
        console.info(`🥰 A client reconnected. ID: ${socket.id}\n`);
      }
    } else {
      // new or unrecoverable session
      if (IN_DEV) {
        console.info(`😊 A client connected. ID: ${socket.id}\n`);
      }

      socket.on('joinLobby', joinLobby(socket));
      socket.on('createLobby', createLobby(socket));
      socket.on('playerReady', playerReady(socket));
      socket.on('leaveLobby', leaveLobby(socket));
      socket.on('playCard', playCard(socket));
      socket.on('lobbyPlayers', lobbyPlayers(socket));
      socket.on('denounce', denounce(socket));
    }
  });

  if (IN_DEV) {
    instrument(io, {
      auth: false,
      mode: 'development',
    });

    console.info('\n\nAdmin website:    https://admin.socket.io \nURL:   http://localhost:3001\npath:   /api/socket\n\n');
  }

  res.end();
};

export default SocketHandler;
