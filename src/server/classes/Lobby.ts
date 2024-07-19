import { v4 as uuid } from 'uuid';
import type { BroadcastOperator } from 'socket.io';
import type { DecorateAcknowledgementsWithMultipleResponses } from 'socket.io/dist/typed-events';

import type { ServerToClientEvents, SocketData } from '@/shared/SocketTypes';

import { cardName, Suit, type Card } from '@/shared/Card';
import { IN_DEV } from 'src/globals';
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

  async removePlayer(playerId: string) {
    const founIdx = this.players.findIndex((p) => p.id === playerId);
    if (founIdx === -1) {
      return;
    }

    const player = this.players.splice(founIdx, 1)[0];

    await player.leaveRoom(this.hash);

    if (!this.players.length) {
      Lobby.lobbies.delete(this.hash);
      return;
    }

    if (IN_DEV) {
      console.info(`😘 PlayerID: ${playerId} left the lobby ${this.hash}\n`);
    }

    this.room?.emit('playerJoined', this.players.map((p) => p.name));
    this.resetGame();
  }

  async addPlayer(player: Player): Promise<boolean> {
    if (this.players.length >= 4) {
      return false;
    }

    this.players.push(player);
    this.room?.emit('playerJoined', this.players.map((p) => p.name));
    this.room = await player.joinRoom(this.hash);

    if (IN_DEV) {
      console.info(`😎 A player joined the Lobby ${this.hash}`);
      console.info(`      Players on Lobby ${this.hash}`);
      console.info(this.players.reduce((info, p, idx) => (`${info}       ${idx}.  ${p.name} (ID: ${p.id})\n`), ''));
    }

    return true;
  }

  setPlayerReady(playerId: string) {
    let allReady = true;
    this.players.forEach((p) => {
      if (p.id === playerId) {
        p.setReady();
        if (IN_DEV) {
          console.info(`🫡  Player ${p.name} (ID: ${p.id}) is ready\n`);
        }
      }

      if (!p.ready) {
        allReady = false;
      }
    });

    if (allReady && this.players.length >= 4) {
      this.startGame();
    }
  }

  playCard(playerId: string, card: Card): boolean {
    const foundIdx = this.players.findIndex((p) => p.id === playerId);
    if (foundIdx === -1) {
      return false;
    }

    if (IN_DEV) {
      console.info(`😉 PlayerID: ${playerId} played ${cardName(card)} of ${Suit[card.suit]}\n`);
    }

    return this.game.play(foundIdx, card);
  }

  private startGame() {
    this.game.start();

    this.players.forEach((player, idx) => {
      player.socket.emit('gameStart', this.game.decks[idx]);
    });

    this.room?.emit('gameChange', this.game.getState());
  }

  private resetGame() {
    this.game = new Game();
    this.results = [];
  }
}
