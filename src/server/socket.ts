import type { NextApiRequest, NextApiResponse } from 'next';

import { Server } from 'Socket.IO';
import type { Http2Server } from 'http2';

import type {
    SocketData,
    InterServerEvents,
    ClientToServerEvents,
    ServerToClientEvents,
} from '../shared/SocketTypes';
import Lobby from './yes/Lobby';
import Player from './yes/Player';

type SocketIOResponse = NextApiResponse & {
    socket: NextApiResponse['socket'] & {
        server: Http2Server & {
            io: Server;
        };
    };
};

let lobbies: Map<string, Lobby> = new Map();

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

        socket.on('joinLobby', (lobbyHash, playerName, callback) => {
            if (!lobbyHash) {
                return callback('', '');
            }

            let lobby = lobbies.get(lobbyHash);
            if (!lobby) {
                lobby = new Lobby();
                lobbies.set(lobby.hash, lobby);
            }

            let player = new Player(socket, playerName);

            if (!lobby.addPlayer(player)) {
                return callback('', '');
            }

            callback(lobby.hash, player.id);
        });
    });

    res.socket!.server.io = io;
    res.end();
};

export default SocketHandler;
