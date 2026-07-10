/* eslint-disable no-param-reassign */
import type { ClientToServerEvents, OurServerSocket } from '@/shared/SocketTypes';

import type { Card } from '@/shared/Card';
import { MessageType } from '@/shared/Message';
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
  (callback) => {
    if (!socket?.data?.lobbyHash || !socket.data.playerId) {
      callback(null);
      return;
    }

    const lobby = Lobby.lobbies.get(socket.data.lobbyHash);
    if (!lobby) {
      callback(null);
      return;
    }

    lobby.setPlayerReady(socket.data.playerId);

    const foundIdx = lobby.players.findIndex((player) => player.id === socket.data.playerId);

    if (foundIdx === -1) {
      callback(null);
      return;
    }

    callback(foundIdx);
  }
);

export const playerUnReady = (socket: OurServerSocket): ClientToServerEvents['playerUnready'] => (
  (callback) => {
    if (!socket?.data?.lobbyHash || !socket.data.playerId) {
      callback(null);
      return;
    }

    const lobby = Lobby.lobbies.get(socket.data.lobbyHash);
    if (!lobby) {
      callback(null);
      return;
    }

    lobby.setPlayerUnReady(socket.data.playerId);

    const foundIdx = lobby.players.findIndex((player) => player.id === socket.data.playerId);

    if (foundIdx === -1) {
      callback(null);
      return;
    }

    callback(foundIdx);
  }
);

export const lobbyPlayers = (socket: OurServerSocket): ClientToServerEvents['lobbyPlayers'] => (
  (lobbyHash, callback) => {
    if (!lobbyHash) {
      return callback('', [], -1);
    }

    const lobby = Lobby.lobbies.get(lobbyHash);
    if (!lobby) {
      return callback('', [], -1);
    }

    // checking if this player is part of this lobby
    const playerIdx = lobby.players.findIndex((p) => p.id === socket.data.playerId);
    if (playerIdx === -1) {
      return callback('', [], -1);
    }

    // returning lobby hash so the client knows it was successful at least
    return callback(
      lobby.hash,
      lobby.players.map((p) => ({
        id: p.id, name: p.name || '____', ready: p.ready, isHost: p.id === lobby.hostId, isBot: p.isBot,
      })),
      playerIdx,
    );
  }
);

export const swapSeat = (socket: OurServerSocket): ClientToServerEvents['swapSeat'] => (
  (indexA, indexB, callback) => {
    if (!socket?.data?.lobbyHash || !socket.data.playerId) {
      return callback({ error: 'Invalid lobby' });
    }

    const lobby = Lobby.lobbies.get(socket.data.lobbyHash);
    if (!lobby) {
      return callback({ error: 'Invalid lobby' });
    }

    if (!lobby.swapSeats(socket.data.playerId, indexA, indexB)) {
      return callback({ error: 'Only the host can change teams' });
    }

    return callback({ data: { ok: true } });
  }
);

export const randomizeTeams = (socket: OurServerSocket): ClientToServerEvents['randomizeTeams'] => (
  (callback) => {
    if (!socket?.data?.lobbyHash || !socket.data.playerId) {
      return callback({ error: 'Invalid lobby' });
    }

    const lobby = Lobby.lobbies.get(socket.data.lobbyHash);
    if (!lobby) {
      return callback({ error: 'Invalid lobby' });
    }

    if (!lobby.randomizeTeams(socket.data.playerId)) {
      return callback({ error: 'Only the host can change teams' });
    }

    return callback({ data: { ok: true } });
  }
);

export const addBot = (socket: OurServerSocket): ClientToServerEvents['addBot'] => (
  (callback) => {
    if (!socket?.data?.lobbyHash || !socket.data.playerId) {
      return callback({ error: 'Invalid lobby' });
    }

    const lobby = Lobby.lobbies.get(socket.data.lobbyHash);
    if (!lobby) {
      return callback({ error: 'Invalid lobby' });
    }

    const res = lobby.addBot(socket.data.playerId);
    if (res !== true) {
      return callback({ error: res });
    }

    return callback({ data: { ok: true } });
  }
);

export const kickPlayer = (socket: OurServerSocket): ClientToServerEvents['kickPlayer'] => (
  async (targetId, callback) => {
    if (!socket?.data?.lobbyHash || !socket.data.playerId) {
      return callback({ error: 'Invalid lobby' });
    }

    const lobby = Lobby.lobbies.get(socket.data.lobbyHash);
    if (!lobby) {
      return callback({ error: 'Invalid lobby' });
    }

    const res = await lobby.kickPlayer(socket.data.playerId, targetId);
    if (res !== true) {
      return callback({ error: res });
    }

    return callback({ data: { ok: true } });
  }
);

export const playCard = (socket: OurServerSocket): ClientToServerEvents['playCard'] => (
  (card: Card, allowRenounce, callback) => {
    if (!socket?.data?.lobbyHash || !socket.data.playerId) {
      callback({ error: 'Invalid lobby' });
      return;
    }

    const lobby = Lobby.lobbies.get(socket.data.lobbyHash);
    if (!lobby) {
      callback({ error: 'Invalid lobby' });
      return;
    }

    const playCardRes = lobby.playCard(socket.data.playerId, card, allowRenounce);
    if (typeof playCardRes === 'string') {
      callback({ error: playCardRes });
    } else {
      callback({ data: playCardRes });
    }
  }
);

export const hideTrump = (socket: OurServerSocket): ClientToServerEvents['hideTrump'] => (
  () => {
    if (!socket?.data?.lobbyHash || !socket.data.playerId) {
      return;
    }

    const lobby = Lobby.lobbies.get(socket.data.lobbyHash);
    if (!lobby) {
      return;
    }

    lobby.hideTrump(socket.data.playerId);
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

export const playerMessage = (socket: OurServerSocket): ClientToServerEvents['message'] => (
  (message) => {
    if (!socket?.data?.lobbyHash || !socket.data.playerId) {
      return;
    }

    const lobby = Lobby.lobbies.get(socket.data.lobbyHash);
    if (!lobby) {
      return;
    }

    if (message.to) {
      message.type = message.type === MessageType.reminder ? MessageType.reminder : MessageType.whisper;
    } else {
      message.type = MessageType.message;
    }

    lobby.emitMessage(message, socket.data.playerId);
  }
);

export const denounce = (socket: OurServerSocket): ClientToServerEvents['denounce'] => (
  (idx) => {
    if (!socket?.data?.lobbyHash || !socket.data.playerId) {
      return;
    }

    const lobby = Lobby.lobbies.get(socket.data.lobbyHash);
    if (!lobby) {
      return;
    }

    lobby.denounce(socket.data.playerId, idx);
  }
);

/**
 * Fired when a socket drops (tab closed, connection lost, mobile backgrounded).
 * The player is kept for a grace period rather than removed immediately, so a
 * brief drop doesn't lose their seat. Without this, abandoned players would
 * leak into `Lobby.lobbies` forever.
 */
export const handleDisconnect = (socket: OurServerSocket) => (
  () => {
    if (!socket?.data?.lobbyHash || !socket.data.playerId) {
      return;
    }

    const lobby = Lobby.lobbies.get(socket.data.lobbyHash);
    if (!lobby) {
      return;
    }

    lobby.scheduleRemoval(socket.data.playerId);
  }
);

/**
 * Fired when a dropped socket is recovered by connectionStateRecovery. The
 * restored `socket.data` lets us find the seat, cancel the pending removal, and
 * rebind the live socket so the server can keep pushing game updates.
 */
export const handleReconnect = (socket: OurServerSocket) => {
  if (!socket?.data?.lobbyHash || !socket.data.playerId) {
    return;
  }

  const lobby = Lobby.lobbies.get(socket.data.lobbyHash);
  if (!lobby) {
    return;
  }

  lobby.reconnect(socket.data.playerId, socket);
};
