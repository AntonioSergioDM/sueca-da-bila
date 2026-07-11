/**
 * A tiny test-side game controller. It listens to the events a client receives
 * and, whenever it's the turn of a seat we control, plays a legal card — then
 * drives the whole hand through to the final `gameResults`.
 *
 * Legality is delegated to the server: we probe our hand with
 * `allowRenounce: false`, and a rejected play (`You must assist!`) leaves the
 * game untouched, so we simply try the next card until one is accepted. A legal
 * move always exists on your turn, so this always finds it.
 */
import type { Card } from '@/shared/Card';
import type { GameState, PlayerState, Score } from '@/shared/GameTypes';

import { emitAck, EventQueue, type TestClient } from './helpers';

export type Observer = {
  client: TestClient;
  /** Latest known cards this seat is holding (only tracked for seats we control). */
  state: { index: number; hand: Card[] };
  gameChanges: EventQueue<GameState>;
  results: EventQueue<Score[]>;
  /** Resolves with this client's dealt hand once the game starts. */
  started: Promise<PlayerState>;
};

/** Wire up the event listeners for a client and expose them as awaitable streams. */
export function observeClient(client: TestClient): Observer {
  const gameChanges = new EventQueue<GameState>();
  const results = new EventQueue<Score[]>();
  const state = { index: -1, hand: [] as Card[] };

  let resolveStarted: (s: PlayerState) => void = () => {};
  const started = new Promise<PlayerState>((resolve) => { resolveStarted = resolve; });

  client.on('gameStart', (playerState) => {
    state.index = playerState.index;
    state.hand = playerState.hand;
    resolveStarted(playerState);
  });
  client.on('gameChange', (gameState) => gameChanges.push(gameState));
  client.on('gameResults', (score) => results.push(score));

  return {
    client, state, gameChanges, results, started,
  };
}

async function playLegalCard(observer: Observer): Promise<void> {
  // Copy the hand: a successful play mutates `state.hand` beneath us.
  for (const card of [...observer.state.hand]) {
    // eslint-disable-next-line no-await-in-loop
    const res = await emitAck(observer.client, 'playCard', card, false);
    if (res && res.error) continue; // illegal (must-assist / wrong-turn) — try the next card
    observer.state.hand = res.data.hand as Card[];
    return;
  }
  throw new Error(`seat ${observer.state.index} had no legal card to play`);
}

/**
 * Play the current game to completion, controlling every seat in `observers`
 * (seats not listed — e.g. bots — are left to the server to play). Resolves with
 * the final score series once `gameResults` fires.
 */
export async function driveGame(observers: Observer[]): Promise<Score[]> {
  const bySeat = new Map<number, Observer>();
  observers.forEach((o) => bySeat.set(o.state.index, o));

  // Every client in the same room receives identical broadcasts, so one stream
  // is enough to follow the game and detect the end.
  const changes = observers[0].gameChanges;
  const resultsPromise = observers[0].results.next();

  let state = await changes.next(); // first gameChange, emitted by startGame
  for (;;) {
    const seat = state.currentPlayer >= 0 ? bySeat.get(state.currentPlayer) : undefined;
    if (seat) {
      // eslint-disable-next-line no-await-in-loop
      await playLegalCard(seat);
    }

    // Advance on the next authoritative event: another state change, or the end.
    // eslint-disable-next-line no-await-in-loop
    const next = await Promise.race([
      changes.next().then((s) => ({ kind: 'change' as const, s })),
      resultsPromise.then((r) => ({ kind: 'results' as const, r })),
    ]);
    if (next.kind === 'results') return next.r;
    state = next.s;
  }
}
