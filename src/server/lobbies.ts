/* eslint-disable no-param-reassign */
import type { ClientToServerEvents, Socket } from '@/shared/SocketTypes';

import Lobby from './classes/Lobby';
import Player from './classes/Player';

export const lobbies: Map<string, Lobby> = new Map();

export const joinLobby = (socket: Socket): ClientToServerEvents['joinLobby'] => (
  (lobbyHash, playerName, callback) => {
    if (!lobbyHash) {
      return callback('');
    }

    const lobby = lobbies.get(lobbyHash);
    if (!lobby) {
      return callback('');
    }

    const player = new Player(socket, playerName);

    if (!lobby.addPlayer(player)) {
      return callback('');
    }

    socket.data.lobbyHash = lobby.hash;
    socket.data.playerId = player.id;

    // returning lobby hash so the client knows it was successful at least
    return callback(lobby.hash);
  }
);

export const createLobby = (socket: Socket): ClientToServerEvents['createLobby'] => (
  (playerName, callback) => {
    const lobby = new Lobby();
    lobbies.set(lobby.hash, lobby);

    const player = new Player(socket, playerName);

    if (!lobby.addPlayer(player)) {
      return callback('');
    }

    socket.data.lobbyHash = lobby.hash;
    socket.data.playerId = player.id;

    return callback(lobby.hash);
  }
);

export const lobbyPlayers = (_: Socket): ClientToServerEvents['lobbyPlayers'] => (
  (lobbyHash, playerName, callback) => {
    console.log('🚀 ~ lobbyHash:', lobbyHash);
    if (!lobbyHash) {
      return callback('', []);
    }

    const lobby = lobbies.get(lobbyHash);
    console.log('🚀 ~ lobby:', lobby);
    if (!lobby) {
      return callback('', []);
    }

    // TODO: change this check to the playerId that should be stored in the browser
    // checking if this player is part of this lobby
    const player = lobby.players.find((p) => p.name === playerName);
    console.log('🚀 ~ player:', player);
    if (!player) {
      return callback('', []);
    }

    // returning lobby hash so the client knows it was successful at least
    return callback(lobby.hash, lobby.players.map((p) => p.name));
  }
);

// export const leaveLobby = (socket: Socket): ClientToServerEvents['createLobby'] => (
//   (playerName, callback) => {
// const lobby = new Lobby();
// lobbies.set(lobby.hash, lobby);

// const player = new Player(socket, playerName);

// if (!lobby.addPlayer(player)) {
//   return callback('', '');
// }

// return callback(lobby.hash, player.id);
//   }
// );
