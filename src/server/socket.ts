import type { NextApiRequest, NextApiResponse } from 'next';

import { Server } from 'socket.io';
import type { Http2Server } from 'http2';
import { instrument } from '@socket.io/admin-ui';

import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  IN_DEV,
  NEXT_URL,
} from '@/globals';

import bcrypt from 'bcryptjs';
import { SiteRoute } from '@/shared/Routes';
import type {
  SocketData,
  InterServerEvents,
  ClientToServerEvents,
  ServerToClientEvents,
} from '@/shared/SocketTypes';

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
      path: SiteRoute.Socket,
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

  if ((ADMIN_USERNAME && ADMIN_PASSWORD)) {
    instrument(io, {
      namespaceName: '/admin',
      auth: {
        type: 'basic',
        username: ADMIN_USERNAME,
        password: bcrypt.hashSync(ADMIN_PASSWORD, 10),
      },
      mode: IN_DEV ? 'development' : 'production',
    });

    console.info(`

  Admin website:    ${NEXT_URL}/admin
  URL:   ${NEXT_URL}
  Username: ${ADMIN_USERNAME}
  Password: ${ADMIN_PASSWORD.replace(/./g, '*')}
  Admin namespace: /admin
  Path:   ${SiteRoute.Socket}

  `);
  }

  res.end();
};

export default SocketHandler;
