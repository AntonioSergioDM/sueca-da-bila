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
import type { Message } from '@/shared/Message';

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

  /** Stable id of the lobby host (the creator). Only the host may change team formations. */
  hostId: string | null = null;

  /**
   * Set once the first game of the lobby has started. Teams are fixed for the
   * lifetime of the lobby after this — they can only be arranged in the lobby
   * before the very first game.
   */
  teamsLocked = false;

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

    // If the host left, hand the role to whoever now sits first.
    if (this.hostId === playerId) {
      this.hostId = this.players[0].id;
    }

    this.emitLobbyUpdate();
    // Removing a player shifts everyone after them down a seat, so refresh
    // each remaining client's seat index.
    this.emitSeats();
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

    // Make sure the recovered client knows its current seat (it may have been
    // reshuffled while disconnected, and the lobby view relies on it).
    player.socket.emit('seatUpdate', this.players.indexOf(player));

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

    // Always re-send the score series so the recovered client's results/history
    // is current — including during the end-of-game window where the decks and
    // table are already cleared but `gameReset` hasn't fired yet.
    player.socket.emit('gameResults', this.game.gameScore);

    if (!this.gameInProgress()) {
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
    // The first player to join is the host (the lobby creator).
    if (!this.hostId) {
      this.hostId = player.id;
    }
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
    const player = this.players.find((p) => p.id === playerId);
    if (!player) {
      return;
    }

    player.setReady(false);
    if (IN_DEV) {
      console.info(`🙃 Player ${player.name} (ID: ${player.id}) is no longer ready\n`);
    }

    this.emitLobbyUpdate();
  }

  /**
   * Whether a game is currently being played. Used to block seat changes so the
   * teams can't be rearranged mid-hand.
   */
  gameInProgress(): boolean {
    return this.game.decks.some((deck) => deck.length > 0)
      || this.game.onTable.some((card) => card !== null);
  }

  /**
   * Host-only. Swap the two occupied seats `idxA` and `idxB`, letting the host
   * arrange the 2v2 teams (even seats vs odd seats). Returns `true` on success,
   * or `false` if the swap isn't allowed.
   */
  swapSeats(playerId: string, idxA: number, idxB: number): boolean {
    // Only the host may rearrange the teams, only before the first game starts.
    if (playerId !== this.hostId || this.teamsLocked || this.gameInProgress()) {
      return false;
    }

    const inRange = (i: number) => Number.isInteger(i) && i >= 0 && i < this.players.length;
    if (!inRange(idxA) || !inRange(idxB) || idxA === idxB) {
      return false;
    }

    [this.players[idxA], this.players[idxB]] = [this.players[idxB], this.players[idxA]];
    this.onTeamsChanged();

    return true;
  }

  /**
   * Host-only. Fisher-Yates shuffle of every seat to form random teams. Returns
   * `true` on success, or `false` if it isn't allowed.
   */
  randomizeTeams(playerId: string): boolean {
    // Only the host may rearrange the teams, only before the first game starts.
    if (playerId !== this.hostId || this.teamsLocked || this.gameInProgress()) {
      return false;
    }

    for (let i = this.players.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.players[i], this.players[j]] = [this.players[j], this.players[i]];
    }

    this.onTeamsChanged();

    return true;
  }

  /**
   * Shared bookkeeping after seats are rearranged: clearing every ready flag
   * forces players to reconfirm their new team (and sidesteps any stale seat
   * index a client may have been holding), then push the fresh seats.
   */
  private onTeamsChanged() {
    this.players.forEach((p) => p.setReady(false));
    this.emitLobbyUpdate();
    this.emitSeats();
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
    this.room?.emit('playersListUpdated', this.players.map((p) => ({
      id: p.id, name: p.name, ready: p.ready, isHost: p.id === this.hostId,
    })));
  }

  /** Tell each socket individually which seat it now holds (drives team display). */
  emitSeats() {
    this.players.forEach((player, idx) => player.socket.emit('seatUpdate', idx));
  }

  emitGameChange() {
    this.room?.emit('gameChange', this.game.getState());
  }

  emitGameResults() {
    this.room?.emit('gameResults', this.game.gameScore);
  }

  emitMessage(message: Message, from: string = '') {
    if (IN_DEV) {
      console.info(`Player ${from} sent a message`, message);
    }

    // eslint-disable-next-line no-param-reassign
    message.from = this.players.find((p) => p.id === from)?.name || from;
    // eslint-disable-next-line no-param-reassign
    message.timestamp = Date.now();

    this.players.forEach((player) => {
      if (player.id === from) return;
      if (message.to && message.to !== player.id) return;

      player.socket.emit('message', message);
    });
  }

  private startGame() {
    // Once the first game starts the teams are locked in for good.
    this.teamsLocked = true;
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
    }, 1500);

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
