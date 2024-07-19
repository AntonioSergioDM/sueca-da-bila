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

    // TODO debug
    console.log('Jogadores no Lobby:');
    this.players.forEach((p) => { console.log(p.name); });

    return true;
  }

  setPlayerReady(playerId: string) {
    let allReady = true;
    this.players.forEach((p) => {
      if (p.id === playerId) {
        p.setReady();
      }

      if (!p.ready) {
        allReady = false;
      }
    });

    if (allReady && this.players.length >= 4) {
      this.startGame();
    }
  }

  startGame() {
    this.game.start();

    this.players.forEach((player, idx) => {
      player.socket.emit('gameStart', this.game.decks[idx]);
    });

    this.room?.emit('gameChange', this.game.getState());
  }
}
