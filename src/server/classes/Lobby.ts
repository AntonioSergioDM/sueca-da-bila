import { v4 as uuid } from 'uuid';
import type Player from './Player';
import Game from './Game';

export default class Lobby {
  static lobbies: Map<string, Lobby> = new Map();

  hash: string;
  players: Array<Player> = [];
  results: Array<number> = [];
  game: Game = new Game();
  room: ReturnType<Player['joinRoom']> = null;


  constructor() {
    this.hash = uuid();
  }

  addPlayer(player: Player): boolean {
    if (this.players.length >= 4) {
      return false;
    }

    this.players.push(player);
    this.room?.emit('playerJoined', this.players.map((p) => p.name));
    this.room = player.joinRoom(this.hash);

    // debug
    console.log('Jogadores no Lobby:');
    this.players.forEach((player) => {
      console.log(player.name);
    });

    return true;
  }

  startGame() {
    this.game.start();
  }
}
