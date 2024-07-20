import type { BroadcastOperator } from 'socket.io';
import type { DecorateAcknowledgementsWithMultipleResponses } from 'socket.io/dist/typed-events';

import {
  names,
  colors,
  animals,
  countries,
  adjectives,
  uniqueNamesGenerator,
} from 'unique-names-generator';

import type { ServerToClientEvents, SocketData } from '@/shared/SocketTypes';

import { IN_DEV } from '@/globals';
import type { PlayerState } from '@/shared/GameTypes';
import { cardName, Suit, type Card } from '@/shared/Card';

import Game from './Game';
import type Player from './Player';

export type LobbyRoom = BroadcastOperator<DecorateAcknowledgementsWithMultipleResponses<ServerToClientEvents>, SocketData>;

const MAX_PLAYERS = 4;

export default class Lobby {
  static lobbies: Map<string, Lobby> = new Map();

  hash: string;

  players: Array<Player> = [];

  results: Array<number> = [];

  game: Game = new Game();

  room: LobbyRoom | null = null;

  constructor() {
    this.hash = Lobby.generateNewHash();
  }

  static generateNewHash(): string {
    const newHash = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, names, animals, countries],
      length: 3,
      separator: '-',
      style: 'lowerCase',
    });

    // In the very low case of generating a already existing
    // one call again until we get a unique name
    if (Lobby.lobbies.has(newHash)) {
      return this.generateNewHash();
    }

    return newHash;
  }

  async removePlayer(playerId: string) {
    const founIdx = this.players.findIndex((p) => p.id === playerId);
    if (founIdx === -1) {
      return;
    }

    const player = this.players.splice(founIdx, 1)[0];

    await player.leaveRoom(this.hash);

    if (IN_DEV) {
      console.info(`😘 PlayerID: ${playerId} left the lobby ${this.hash}\n`);
    }

    if (!this.players.length) {
      Lobby.lobbies.delete(this.hash);

      if (IN_DEV) {
        console.info(`💀 Lobby ${this.hash} closed!\n`);
      }

      return;
    }

    this.emitLobbyUpdate();
    this.resetGame();
  }

  async addPlayer(player: Player): Promise<boolean> {
    if (this.players.length >= MAX_PLAYERS) {
      return false;
    }

    this.players.push(player);
    this.emitLobbyUpdate();
    this.room = await player.joinRoom(this.hash);

    if (IN_DEV) {
      console.info(`😎 A player joined the Lobby ${this.hash}`);
      console.info(`      Players on Lobby ${this.hash}`);
      console.info(this.players.reduce((info, p, idx) => (`${info}       ${idx}.  ${p.name} (ID: ${p.id})\n`), ''));
    }

    return true;
  }

  emitLobbyUpdate() {
    this.room?.emit('playersListUpdated', this.players.map((p) => ({ name: p.name, ready: p.ready })));
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

    this.emitLobbyUpdate();

    if (allReady && this.players.length >= MAX_PLAYERS) {
      this.startGame();
    }
  }

  playCard(playerId: string, card: Card): PlayerState | null {
    const foundIdx = this.players.findIndex((p) => p.id === playerId);
    if (foundIdx === -1) {
      return null;
    }

    if (IN_DEV) {
      console.info(`😉 PlayerID: ${playerId} played ${cardName(card)} of ${Suit[card.suit]}\n`);
    }

    if (!this.game.play(foundIdx, card)) {
      return null;
    }

    if (IN_DEV) {
      console.info('    Card Played');
    }

    this.room?.emit('gameChange', this.game.getState());

    if (this.game.currPlayer < 0) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      setTimeout(
        () => {
          that.game.clearTable();
          that.room?.emit('gameChange', that.game.getState());
        },
        2000,
      );
    }

    return {
      index: foundIdx,
      hand: this.game.decks[foundIdx],
    };
  }

  private startGame() {
    this.game.start();

    if (IN_DEV) {
      console.info(`♠️ ♦️ ♣️ ♥️ Game started on Lobby ${this.hash}\n`);
    }

    this.players.forEach((player, idx) => {
      player.socket.emit('gameStart', {
        index: idx,
        hand: this.game.decks[idx],
      });
    });

    this.room?.emit('gameChange', this.game.getState());
  }

  private resetGame() {
    this.game = new Game();
    this.results = [];
    this.players.forEach((p) => {
      p.setReady(false);
      if (IN_DEV) {
        console.info(`🙃 Player ${p.name} (ID: ${p.id}) is no longer ready\n`);
      }
    });

    if (IN_DEV) {
      console.info(`🃏 Game restarted on Lobby ${this.hash}\n`);
    }

    this.room?.emit('gameReset');
  }
}
