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
import { DenounceErrors, type PlayerState } from '@/shared/GameTypes';
import { cardName, Suit, type Card } from '@/shared/Card';

import Game from './Game';
import type Player from './Player';

export type LobbyRoom = BroadcastOperator<DecorateAcknowledgementsWithMultipleResponses<ServerToClientEvents>, SocketData>;

export default class Lobby {
  static lobbies: Map<string, Lobby> = new Map();

  /** How long a disconnected player is kept before being dropped from the lobby (matches connectionStateRecovery) */
  static reconnectGraceMs = 2 * 60 * 1000;

  hash: string;

  players: Array<Player> = [];

  game: Game = new Game();

  room: LobbyRoom | null = null;

  constructor() {
    this.hash = Lobby.generateNewHash();
  }

  static generateNewHash(): string {
    const newHash = IN_DEV ? Lobby.lobbies.size.toString() : uniqueNamesGenerator({
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

    if (player.disconnectTimer) {
      clearTimeout(player.disconnectTimer);
      player.disconnectTimer = null;
    }

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

  /**
   * A player's socket dropped. Keep them in the lobby for a grace period so a
   * flaky connection (very common on mobile) can recover without losing the seat.
   */
  scheduleRemoval(playerId: string) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player || player.disconnectTimer) {
      return;
    }

    if (IN_DEV) {
      console.info(`🔌 PlayerID: ${playerId} disconnected from ${this.hash}, ${Lobby.reconnectGraceMs / 1000}s to reconnect\n`);
    }

    player.disconnectTimer = setTimeout(() => {
      player.disconnectTimer = null;
      void this.removePlayer(playerId);
    }, Lobby.reconnectGraceMs);
  }

  /**
   * A recovered socket came back. Cancel the pending removal and rebind the
   * player's socket so future server emits reach the new connection.
   */
  reconnect(playerId: string, socket: Player['socket']): boolean {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) {
      return false;
    }

    if (player.disconnectTimer) {
      clearTimeout(player.disconnectTimer);
      player.disconnectTimer = null;
    }

    player.socket = socket;

    // Re-push the authoritative state to the recovered socket. Without this the
    // client keeps whatever it had in memory before dropping, so a player who
    // disconnected across a trick-clear boundary keeps rendering the previous
    // (already scored) trick until the next card is played.
    this.emitGameStateTo(player);

    if (IN_DEV) {
      console.info(`🔌 PlayerID: ${playerId} reconnected to ${this.hash}\n`);
    }

    return true;
  }

  /**
   * Send the current game snapshot to a single player's socket. Used to bring a
   * (re)connected client back in sync. No-op when no game is in progress — the
   * lobby view is driven by `playersListUpdated` instead.
   */
  emitGameStateTo(player: Player) {
    const idx = this.players.indexOf(player);
    if (idx === -1) {
      return;
    }

    const gameInProgress = this.game.decks.some((deck) => deck.length > 0)
      || this.game.onTable.some((card) => card !== null);

    if (!gameInProgress) {
      return;
    }

    player.socket.emit('gameStart', {
      index: idx,
      hand: this.game.decks[idx],
    });
    player.socket.emit('gameChange', this.game.getState());
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

  setPlayerUnReady(playerId: string) {
    this.players.forEach((p) => {
      if (p.id === playerId) {
        p.setReady(false);
        if (IN_DEV) {
          console.info(`🙃 Player ${p.name} (ID: ${p.id}) is no longer ready\n`);
        }
      }
    });

    this.emitLobbyUpdate();
  }

  playCard(playerId: string, card: Card, allowRenounce = false): PlayerState | string {
    const foundIdx = this.players.findIndex((p) => p.id === playerId);
    if (foundIdx === -1) {
      return 'Invalid player';
    }

    if (IN_DEV) {
      console.info(`😉 PlayerID: ${playerId} played ${cardName(card)} of ${Suit[card.suit]}\n`);
    }

    const playRes = this.game.play(foundIdx, card, allowRenounce);

    if (typeof playRes === 'string') {
      return playRes;
    }

    if (IN_DEV) {
      console.info('    Card Played');
    }

    this.emitGameChange();

    if (this.game.currPlayer < 0) {
      setTimeout(
        () => this.endTurn(),
        2000,
      );
    }

    return {
      index: foundIdx,
      hand: this.game.decks[foundIdx],
    };
  }

  endTurn() {
    // This runs on a timer scheduled when the last card of a trick was played.
    // By the time it fires the trick may already have been resolved and the
    // table reset by another path — a correct denúncia ends the game, or a
    // player leaving rebuilds the game — leaving an incomplete table. Scoring
    // that would trip `clearTable`'s no-nulls invariant and crash the server.
    if (this.game.onTable.some((card) => card === null)) {
      return;
    }

    this.game.clearTable();
    this.emitGameChange();
    this.checkEnd();
  }

  hideTrump(playerId: string) {
    const foundIdx = this.players.findIndex((p) => p.id === playerId);
    if (foundIdx === -1) {
      return;
    }

    if (this.game.hideTrump(foundIdx)) {
      this.emitGameChange();
    }
  }

  denounce(playerId: string, denounceIdx: number) {
    const playerIdx = this.players.findIndex((p) => p.id === playerId);

    if (playerIdx === -1) {
      return DenounceErrors.invalidPlayer;
    }

    const res = this.game.denounce(playerIdx, denounceIdx);

    // The game may have ended
    if (!this.checkEnd()) {
      // Give an update even if the game continues
      this.emitGameResults();
    }
    return res;
  }

  emitLobbyUpdate() {
    this.room?.emit('playersListUpdated', this.players.map((p) => ({ name: p.name, ready: p.ready })));
  }

  emitGameChange() {
    this.room?.emit('gameChange', this.game.getState());
  }

  emitGameResults() {
    this.room?.emit('gameResults', this.game.gameScore);
  }

  private startGame() {
    this.game.start();

    if (IN_DEV) {
      console.info(`♠️ ♦️ Game started on Lobby ${this.hash} ♣️ ♥️\n`);
    }

    this.players.forEach((player, idx) => {
      player.socket.emit('gameStart', {
        index: idx,
        hand: this.game.decks[idx],
      });
    });

    this.emitGameChange();
  }

  private checkEnd() {
    if (!this.game.isEnded()) {
      return false;
    }

    if (IN_DEV) {
      console.info(this.game.gameScore.reduce(
        (str, s, i) => `${str}${i.toString().padStart(7, ' ')}:  ${s[0].toString().padStart(3, ' ')} | ${s[1].toString().padStart(3, ' ')}\n`,
        'Results: Even | Odd \n',
      ));
    }

    this.emitGameResults();

    // Show the final trick briefly, then send everyone back to the lobby to
    // review the score/stats and ready up before the next game starts.
    setTimeout(() => {
      this.players.forEach((p) => p.setReady(false));
      this.room?.emit('gameReset');
      this.emitLobbyUpdate();

      if (IN_DEV) {
        console.info(`🃏 Game over on Lobby ${this.hash}, waiting for players to ready up\n`);
      }
    }, 3000);

    return true;
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
    // The score series belongs to the old game instance; clear it on clients too.
    this.emitGameResults();
  }
}
