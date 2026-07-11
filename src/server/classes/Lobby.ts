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

import { chooseCard } from '../bot/suecaBot';

import Game from './Game';
import Player from './Player';

export type LobbyRoom = BroadcastOperator<DecorateAcknowledgementsWithMultipleResponses<ServerToClientEvents>, SocketData>;

export default class Lobby {
  static lobbies: Map<string, Lobby> = new Map();

  /** How long a disconnected player is kept before being dropped from the lobby (matches connectionStateRecovery) */
  static reconnectGraceMs = 2 * 60 * 1000;

  /** How long a bot "thinks" before playing its card, so its moves feel human. */
  static botTurnDelayMs = 1000;

  /** Names handed to bots, in order; falls back to a numbered name when exhausted. */
  static botNames = ['Claudio', 'Bilinha', 'Zé Bot', 'Mafalda', 'Xico', 'Robó'];

  hash: string;

  players: Array<Player> = [];

  /** Stable id of the lobby host (the creator). Only the host may change team formations. */
  hostId: string | null = null;

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
    const player = this.players.find((p) => p.id === playerId);
    if (player) {
      player.setReady();
      if (IN_DEV) {
        console.info(`🫡  Player ${player.name} (ID: ${player.id}) is ready\n`);
      }
    }

    this.emitLobbyUpdate();
    this.startIfAllReady();
  }

  /** Start the game once every seat is filled and every player is ready. */
  private startIfAllReady() {
    if (this.players.length >= Game.numPlayers && this.players.every((p) => p.ready)) {
      this.startGame();
    }
  }

  /**
   * Host-only. Add an engine-driven bot to an open seat. Bots can only be added
   * in the lobby (before a game is underway) and never beyond a full table.
   */
  addBot(requesterId: string): true | string {
    if (requesterId !== this.hostId) {
      return 'Only the host can add bots';
    }

    if (this.gameInProgress()) {
      return 'Bots can only be added between games';
    }

    if (this.players.length >= Game.numPlayers) {
      return 'The lobby is full';
    }

    const bot = Player.createBot(this.nextBotName());
    this.players.push(bot);

    if (IN_DEV) {
      console.info(`🤖 Bot ${bot.name} added to lobby ${this.hash}\n`);
    }

    this.emitLobbyUpdate();
    // A bot is ready by default, so adding one may complete the table.
    this.startIfAllReady();
    return true;
  }

  /**
   * Host-only. Remove any player or bot from the lobby — allowed in the lobby or
   * between games, but never mid-game. The host cannot kick themselves.
   */
  async kickPlayer(requesterId: string, targetId: string): Promise<true | string> {
    if (requesterId !== this.hostId) {
      return 'Only the host can remove players';
    }

    if (requesterId === targetId) {
      return 'You cannot remove yourself';
    }

    if (this.gameInProgress()) {
      return 'Cannot remove players mid-game';
    }

    const target = this.players.find((p) => p.id === targetId);
    if (!target) {
      return 'Player not found';
    }

    // Let a kicked human's client leave the lobby view; bots have no socket.
    if (!target.isBot) {
      target.socket.emit('kicked');
    }

    await this.removePlayer(targetId);
    return true;
  }

  /** First unused name from the pool, or a numbered fallback. */
  private nextBotName(): string {
    const taken = new Set(this.players.map((p) => p.name));
    const free = Lobby.botNames.find((name) => !taken.has(name));
    return free ?? `Bot ${this.players.length + 1}`;
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
    // Only the host may rearrange the teams, and never mid-game.
    if (playerId !== this.hostId || this.gameInProgress()) {
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
    // Only the host may rearrange the teams, and never mid-game.
    if (playerId !== this.hostId || this.gameInProgress()) {
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
    // setReady is a no-op for bots, so only humans reconfirm their new team.
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
    } else {
      // The turn advanced to the next player — let a bot take it if it's theirs.
      this.scheduleBotTurn();
    }

    return {
      index: foundIdx,
      hand: this.game.decks[foundIdx],
    };
  }

  /**
   * If the player now on turn is a bot, have it hide its trump (when allowed) and
   * play a chosen card after a short, human-feeling delay. Each bot move chains
   * back through `playCard`, so consecutive bots resolve automatically.
   */
  private scheduleBotTurn() {
    const idx = this.game.currPlayer;
    if (idx < 0) {
      return;
    }

    const player = this.players[idx];
    if (!player || !player.isBot) {
      return;
    }

    const botId = player.id;
    setTimeout(() => {
      // The world may have moved on during the delay (a human left and rebuilt
      // the game, the game ended, the trick resolved). Only act if it is still
      // this exact bot's turn.
      if (this.game.currPlayer !== idx || this.players[idx]?.id !== botId) {
        return;
      }

      // A thoughtful trump holder tucks their trump card away once allowed.
      this.hideTrump(botId);

      const card = chooseCard(this.game, idx);
      if (!card) {
        return;
      }

      const res = this.playCard(botId, card);
      if (typeof res === 'string' && IN_DEV) {
        console.warn(`🤖 Bot ${player.name} made an illegal move: ${res}\n`);
      }
    }, Lobby.botTurnDelayMs);
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
    // If the game continues, the trick winner leads next — which may be a bot.
    if (!this.checkEnd()) {
      this.scheduleBotTurn();
    }
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
      id: p.id, name: p.name, ready: p.ready, isHost: p.id === this.hostId, isBot: p.isBot,
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
    // The first player to lead may be a bot.
    this.scheduleBotTurn();
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
      // Bots ready up automatically for the next game; humans must ready again.
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
      // setReady is a no-op for bots, so they stay ready across resets.
      p.setReady(false);
      if (IN_DEV && !p.isBot) {
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
