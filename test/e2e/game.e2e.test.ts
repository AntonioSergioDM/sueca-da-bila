import {
  afterAll, afterEach, beforeAll, describe, expect, it,
} from 'vitest';

import Lobby from '@/server/classes/Lobby';
import Game from '@/server/classes/Game';
import { cardName, Suit } from '@/shared/Card';

import {
  connectClient, disconnectAll, emitAck, startTestServer, type TestClient, type TestServer,
} from './helpers';
import { driveGame, observeClient, type Observer } from './gameDriver';

// A card is uniquely identified by suit + rank index.
const cardKey = (c: { suit: number | string; value: number }) => `${Number(c.suit)}:${c.value}`;

describe('Sueca realtime e2e', () => {
  let server: TestServer;
  const clients: TestClient[] = [];

  beforeAll(async () => {
    // Collapse the human-feel delays so a full 10-trick game runs in well under
    // a second instead of ~25s, and disconnected sockets are reclaimed quickly.
    Lobby.botTurnDelayMs = 5;
    Lobby.endTurnDelayMs = 5;
    Lobby.endGameResetDelayMs = 5;
    Lobby.reconnectGraceMs = 30;

    server = await startTestServer();
  });

  afterEach(async () => {
    await disconnectAll(clients.splice(0));
    // Drop any lobby left behind so tests can't leak state into each other.
    Lobby.lobbies.clear();
  });

  afterAll(async () => {
    await server.close();
  });

  /** Connect `n` fresh clients, tracked for teardown. */
  async function connect(n: number): Promise<TestClient[]> {
    const conns = await Promise.all(Array.from({ length: n }, () => connectClient(server.url)));
    clients.push(...conns);
    return conns;
  }

  it('creates a lobby, seats four players, and deals ten cards each on start', async () => {
    const [c0, c1, c2, c3] = await connect(4);
    const observers = [c0, c1, c2, c3].map(observeClient);

    const created = await emitAck(c0, 'createLobby', 'Alice');
    expect(created.error).toBeUndefined();
    const { lobbyHash } = created.data;
    expect(lobbyHash).toBeTruthy();

    for (const [client, name] of [[c1, 'Bob'], [c2, 'Cara'], [c3, 'Dan']] as const) {
      // eslint-disable-next-line no-await-in-loop
      const joined = await emitAck(client, 'joinLobby', lobbyHash, name);
      expect(joined.error).toBeUndefined();
      expect(joined.data.lobbyHash).toBe(lobbyHash);
    }

    // The lobby roster is visible to a member and lists all four seats.
    const [hash, players, myIndex] = await emitAck(c0, 'lobbyPlayers', lobbyHash);
    expect(hash).toBe(lobbyHash);
    expect(myIndex).toBe(0);
    expect(players.map((p: { name: string }) => p.name)).toEqual(['Alice', 'Bob', 'Cara', 'Dan']);
    expect(players[0].isHost).toBe(true);

    // Everyone readies up; the fourth ready starts the game.
    const seatIndexes = await Promise.all(
      [c0, c1, c2, c3].map((c) => emitAck(c, 'playerReady')),
    );
    expect(seatIndexes.sort()).toEqual([0, 1, 2, 3]);

    const hands = await Promise.all(observers.map((o) => o.started));

    // Each player is dealt exactly ten cards, seats are 0..3, and the union of
    // all four hands is the full, non-overlapping 40-card deck.
    expect(hands.map((h) => h.index).sort()).toEqual([0, 1, 2, 3]);
    hands.forEach((h) => expect(h.hand).toHaveLength(Game.cardsPerPlayer));

    const allCards = hands.flatMap((h) => h.hand);
    expect(allCards).toHaveLength(40);
    expect(new Set(allCards.map(cardKey)).size).toBe(40);
  });

  it('plays a full four-human game through to a valid final score', async () => {
    const conns = await connect(4);
    const observers = conns.map(observeClient);

    const { data } = await emitAck(conns[0], 'createLobby', 'P0');
    const { lobbyHash } = data;
    await Promise.all([
      emitAck(conns[1], 'joinLobby', lobbyHash, 'P1'),
      emitAck(conns[2], 'joinLobby', lobbyHash, 'P2'),
      emitAck(conns[3], 'joinLobby', lobbyHash, 'P3'),
    ]);

    await Promise.all(conns.map((c) => emitAck(c, 'playerReady')));
    await Promise.all(observers.map((o) => o.started));

    const gameScore = await driveGame(observers);

    // Exactly one game was scored, and its two team totals account for every
    // point in the deck (120, or 121 when a team sweeps every trick — bandeira).
    expect(gameScore).toHaveLength(1);
    const [even, odd] = gameScore[0];
    expect(Number.isInteger(even)).toBe(true);
    expect(Number.isInteger(odd)).toBe(true);
    expect(even + odd).toBeGreaterThanOrEqual(Game.maxPoints);
    expect(even + odd).toBeLessThanOrEqual(Game.maxPoints + 1);
  }, 20000);

  it('lets the host fill the table with bots and plays a bot-driven game to the end', async () => {
    const [host] = await connect(1);
    const observer: Observer = observeClient(host);

    const { data } = await emitAck(host, 'createLobby', 'Human');
    expect(data.lobbyHash).toBeTruthy();

    // Three bots fill seats 1..3; the game only starts once the human readies too.
    for (let i = 0; i < 3; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const res = await emitAck(host, 'addBot');
      expect(res.data.ok).toBe(true);
    }

    const roster = await emitAck(host, 'lobbyPlayers', data.lobbyHash);
    const botFlags = roster[1].map((p: { isBot: boolean }) => p.isBot);
    expect(botFlags).toEqual([false, true, true, true]);

    await emitAck(host, 'playerReady');
    await observer.started;

    // The human plays its own seat; the server drives the three bots.
    const gameScore = await driveGame([observer]);

    expect(gameScore).toHaveLength(1);
    const [even, odd] = gameScore[0];
    expect(even + odd).toBeGreaterThanOrEqual(Game.maxPoints);
    expect(even + odd).toBeLessThanOrEqual(Game.maxPoints + 1);
  }, 20000);

  it('rejects a card played out of turn', async () => {
    const conns = await connect(4);
    const observers = conns.map(observeClient);

    const { data } = await emitAck(conns[0], 'createLobby', 'P0');
    await Promise.all([
      emitAck(conns[1], 'joinLobby', data.lobbyHash, 'P1'),
      emitAck(conns[2], 'joinLobby', data.lobbyHash, 'P2'),
      emitAck(conns[3], 'joinLobby', data.lobbyHash, 'P3'),
    ]);
    await Promise.all(conns.map((c) => emitAck(c, 'playerReady')));
    const hands = await Promise.all(observers.map((o) => o.started));

    // Find a seat that is NOT the opening leader and have it try to play first.
    const firstState = await observers.find((o) => o.state.index === 0)!.gameChanges.next();
    const leader = firstState.currentPlayer;
    const offTurnSeat = (leader + 1) % Game.numPlayers;
    const offTurnHand = hands.find((h) => h.index === offTurnSeat)!.hand;

    const res = await emitAck(conns[offTurnSeat], 'playCard', offTurnHand[0], false);
    expect(res.error).toBeTruthy();
    // Sanity check the encoding helpers are wired up for a real dealt card.
    expect(typeof cardName(offTurnHand[0])).toBe('string');
    expect(Suit[offTurnHand[0].suit as number]).toBeTruthy();
  }, 20000);
});
