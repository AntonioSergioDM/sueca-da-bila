import type { Socket } from 'Socket.IO';
import type { ClientToServerEvents } from '../shared/SocketTypes';
import Lobby from './classes/Lobby';
import Player from './classes/Player';

export const lobbies: Map<string, Lobby> = new Map();
export const joinLobby = (socket: Socket): ClientToServerEvents['joinLobby'] => (lobbyHash, playerName, callback) => {
    if (!lobbyHash) {
        return callback('', '');
    }

    const lobby = lobbies.get(lobbyHash);
    if (!lobby) {
        return callback('', '');
    }

    const player = new Player(socket, playerName);

    if (!lobby.addPlayer(player)) {
        return callback('', '');
    }

    callback(lobby.hash, player.id);
};

export const createLobby = (socket: Socket): ClientToServerEvents['createLobby'] => (playerName, callback) => {
    const lobby = new Lobby();
    lobbies.set(lobby.hash, lobby);

    const player = new Player(socket, playerName);

    if (!lobby.addPlayer(player)) {
        return callback('', '');
    }

    callback(lobby.hash, player.id);
};

export const leaveLobby = (socket: Socket): ClientToServerEvents['createLobby'] => (playerName, callback) => {
    const lobby = new Lobby();
    lobbies.set(lobby.hash, lobby);

    const player = new Player(socket, playerName);

    if (!lobby.addPlayer(player)) {
        return callback('', '');
    }

    callback(lobby.hash, player.id);
};
