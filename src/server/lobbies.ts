/* eslint-disable no-param-reassign */
import type { ClientToServerEvents, OurServerSocket } from '@/shared/SocketTypes';

import type { Card } from '@/shared/Card';
import Lobby from './classes/Lobby';
import Player from './classes/Player';

export const joinLobby = (socket: OurServerSocket): ClientToServerEvents['joinLobby'] => (
  async (lobbyHash, playerName, callback) => {
    if (!lobbyHash) {
      return callback({ error: 'Invalid lobby' });
    }

    const lobby = Lobby.lobbies.get(lobbyHash);
    if (!lobby) {
      return callback({ error: 'Invalid lobby' });
    }

    const player = new Player(socket, playerName);

    if (!(await lobby.addPlayer(player))) {
      return callback({ error: 'Failed to add player. Lobby full?' });
    }

    socket.data.lobbyHash = lobby.hash;
    socket.data.playerId = player.id;

    // returning lobby hash so the client knows it was successful at least
    return callback({ data: { lobbyHash: lobby.hash } });
  }
);

export const createLobby = (socket: OurServerSocket): ClientToServerEvents['createLobby'] => (
  async (playerName, callback) => {
    const lobby = new Lobby();
    Lobby.lobbies.set(lobby.hash, lobby);

    const player = new Player(socket, playerName);

    if (!(await lobby.addPlayer(player))) {
      return callback({ error: 'Failed to add player' });
    }

    socket.data.lobbyHash = lobby.hash;
    socket.data.playerId = player.id;

    return callback({ data: { lobbyHash: lobby.hash } });
  }
);

export const playerReady = (socket: OurServerSocket): ClientToServerEvents['playerReady'] => (
  () => {
    if (!socket?.data?.lobbyHash || !socket.data.playerId) {
      return;
    }

    const lobby = Lobby.lobbies.get(socket.data.lobbyHash);
    if (!lobby) {
      return;
    }

    lobby.setPlayerReady(socket.data.playerId);
  }
);

export const lobbyPlayers = (socket: OurServerSocket): ClientToServerEvents['lobbyPlayers'] => (
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

export const playCard = (socket: OurServerSocket): ClientToServerEvents['playCard'] => (
  (card: Card, callback) => {
    if (!socket?.data?.lobbyHash || !socket.data.playerId) {
      callback(null);
      return;
    }

    const lobby = Lobby.lobbies.get(socket.data.lobbyHash);
    if (!lobby) {
      callback(null);
      return;
    }

    callback(lobby.playCard(socket.data.playerId, card));
  }
);

export const leaveLobby = (socket: OurServerSocket): ClientToServerEvents['leaveLobby'] => (
  async () => {
    if (!socket?.data?.lobbyHash || !socket.data.playerId) {
      return;
    }

    const lobby = Lobby.lobbies.get(socket.data.lobbyHash);
    if (!lobby) {
      return;
    }

    await lobby.removePlayer(socket.data.playerId);
  }
);
