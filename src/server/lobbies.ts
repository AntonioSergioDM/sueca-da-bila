/* eslint-disable no-param-reassign */
import type { ClientToServerEvents, Socket } from '@/shared/SocketTypes';

import Lobby from './classes/Lobby';
import Player from './classes/Player';

export const joinLobby = (socket: Socket): ClientToServerEvents['joinLobby'] => (
  async (lobbyHash, playerName, callback) => {
    if (!lobbyHash) {
      return callback('');
    }

    const lobby = Lobby.lobbies.get(lobbyHash);
    if (!lobby) {
      return callback('');
    }

    const player = new Player(socket, playerName);

    if (!(await lobby.addPlayer(player))) {
      return callback('');
    }

    socket.data.lobbyHash = lobby.hash;
    socket.data.playerId = player.id;

    // returning lobby hash so the client knows it was successful at least
    return callback(lobby.hash);
  }
);

export const createLobby = (socket: Socket): ClientToServerEvents['createLobby'] => (
  async (playerName, callback) => {
    const lobby = new Lobby();
    Lobby.lobbies.set(lobby.hash, lobby);

    const player = new Player(socket, playerName);

    if (!(await lobby.addPlayer(player))) {
      return callback('');
    }

    socket.data.lobbyHash = lobby.hash;
    socket.data.playerId = player.id;

    return callback(lobby.hash);
  }
);

export const lobbyPlayers = (socket: Socket): ClientToServerEvents['lobbyPlayers'] => (
  (lobbyHash, callback) => {
    if (!lobbyHash) {
      return callback('', []);
    }

    const lobby = Lobby.lobbies.get(lobbyHash);
    if (!lobby) {
      return callback('', []);
    }

    // checking if this player is part of this lobby
    const player = lobby.players.find((p) => p.id === socket.data.playerId);
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
// Lobby.lobbies.set(lobby.hash, lobby);

// const player = new Player(socket, playerName);

// if (!lobby.addPlayer(player)) {
//   return callback('', '');
// }

// return callback(lobby.hash, player.id);
//   }
// );
