import { v4 as uuid } from 'uuid';
import type { BroadcastOperator } from 'socket.io';
import type { DecorateAcknowledgementsWithMultipleResponses } from 'socket.io/dist/typed-events';

import type { ServerToClientEvents, SocketData } from '@/shared/SocketTypes';

import Game from './Game';
import type Player from './Player';

export type LobbyRoom = BroadcastOperator<DecorateAcknowledgementsWithMultipleResponses<ServerToClientEvents>, SocketData>;

export default class Lobby {
  static lobbies: Map<string, Lobby> = new Map();

  hash: string;

  players: Array<Player> = [];

  results: Array<number> = [];

  game: Game = new Game();

  room: LobbyRoom | null = null;

  constructor() {
    this.hash = uuid();
  }

  async addPlayer(player: Player): Promise<boolean> {
    if (this.players.length >= 4) {
      return false;
    }

    this.players.push(player);
    this.room?.emit('playerJoined', this.players.map((p) => p.name));
    this.room = await player.joinRoom(this.hash);

    // debug
    console.log('Jogadores no Lobby:');
    this.players.forEach((p) => { console.log(p.name); });

    return true;
  }

  startGame() {
    this.game.start();
  }
}
