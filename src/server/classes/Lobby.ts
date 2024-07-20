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

export default class Lobby {
  static lobbies: Map<string, Lobby> = new Map();

  hash: string;

  players: Array<Player> = [];

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
    if (this.players.length >= Game.numPlayers) {
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

    if (allReady && this.players.length >= Game.numPlayers) {
      this.startGame();
    }
  }

  playCard(playerId: string, card: Card): PlayerState | string {
    const foundIdx = this.players.findIndex((p) => p.id === playerId);
    if (foundIdx === -1) {
      return 'Invalid player';
    }

    if (IN_DEV) {
      console.info(`😉 PlayerID: ${playerId} played ${cardName(card)} of ${Suit[card.suit]}\n`);
    }

    const playRes = this.game.play(foundIdx, card);

    if (typeof playRes === 'string') {
      return playRes;
    }

    if (IN_DEV) {
      console.info('    Card Played');
    }

    this.emitGameChange();

    if (this.game.currPlayer < 0) {
      setTimeout(
        this.endTurn.bind(this),
        2000,
      );
    }

    return {
      index: foundIdx,
      hand: this.game.decks[foundIdx],
    };
  }

  endTurn() {
    this.game.clearTable();
    this.emitGameChange();
    if (this.game.isEnded()) {
      this.room?.emit('gameResults', this.game.gameScore);
      this.game.start();
    }
  }

  emitLobbyUpdate() {
    this.room?.emit('playersListUpdated', this.players.map((p) => ({ name: p.name, ready: p.ready })));
  }

  emitGameChange() {
    this.room?.emit('gameChange', this.game.getState());
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

    this.emitGameChange();
  }

  private resetGame() {
    this.game = new Game();
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
    this.emitLobbyUpdate();
  }
}
