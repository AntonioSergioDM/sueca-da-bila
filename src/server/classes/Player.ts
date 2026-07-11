import { v4 as uuid } from 'uuid';
import type { Room } from 'socket.io-adapter';

import type { OurServerSocket } from '@/shared/SocketTypes';

import { io } from '../socket';

/**
 * A stand-in socket for bots, which have no real connection. Every method is a
 * no-op so the shared `Player`/`Lobby` code that emits to sockets or manages
 * rooms can treat a bot exactly like a connected human without special-casing.
 */
const createBotSocket = (): OurServerSocket => ({
  emit: () => true,
  join: async () => {},
  leave: async () => {},
  on: () => {},
  data: { lobbyHash: null, playerId: null },
} as unknown as OurServerSocket);

export default class Player {
  id: string;

  name: string;

  socket: OurServerSocket;

  ready: boolean = false;

  /** Bots are engine-driven players with no socket; they are always ready. */
  isBot: boolean = false;

  /** Pending removal timer, set while the player is disconnected but still within the reconnect grace window */
  disconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(socket: OurServerSocket, name?: string) {
    this.socket = socket;
    this.name = name || '';
    this.id = uuid();
  }

  /** Build an engine-driven bot player, ready to play from the start. */
  static createBot(name: string): Player {
    const bot = new Player(createBotSocket(), name);
    bot.isBot = true;
    bot.ready = true;
    return bot;
  }

  async joinRoom(room: Room) {
    await this.socket.join(room);

    return io?.to(room) || null;
  }

  async leaveRoom(room: Room) {
    await this.socket.leave(room);
  }

  setReady(state: boolean = true) {
    // Bots are always ready; ignore any attempt to un-ready them so a game can
    // never stall waiting on a bot that will never ready itself.
    if (this.isBot) {
      return;
    }
    this.ready = state;
  }
}
