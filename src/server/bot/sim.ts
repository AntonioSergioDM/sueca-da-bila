/* eslint-disable no-console */
/**
 * Bot strength benchmark (a dev script — not part of the app bundle).
 *
 * Pits the production bot (`chooseCard`, even team = seats 0 & 2) against a
 * deliberately naive greedy baseline (odd team = seats 1 & 3) over many
 * self-played games, and reports win rate and average points. Use it as a
 * regression yardstick: run it before and after changing `suecaBot.ts` to see
 * whether a tweak actually made the bot stronger.
 *
 *   npm run bot:sim           # default number of games
 *   npm run bot:sim 20000     # more games = tighter, less noisy numbers
 *
 * The deal is rotated every game so no seat/team is structurally favoured, and
 * an illegal-move counter (should always be 0) doubles as a correctness check
 * on the bot: every card it returns must be a legal play.
 */
import { pointsOf, type Card } from '@/shared/Card';

import Game from '../classes/Game';
import { chooseCard } from './suecaBot';

const suitOf = (c: Card) => Number(c.suit);
const valueOf = (c: Card) => pointsOf(c) * 100 + c.value;

/**
 * Deliberately naive opponent: follow suit, win the trick as cheaply as it can,
 * otherwise throw its lowest-value card. No card counting, no partner
 * awareness — the floor the real bot is expected to clear comfortably.
 */
const greedyBaseline = (game: Game, myIdx: number): Card | null => {
  const hand = game.decks[myIdx];
  if (!hand.length) return null;

  const trump = Number(game.trump);
  const lead = game.tableSuit === null ? -1 : Number(game.tableSuit);
  const followers = hand.filter((c) => suitOf(c) === lead);
  const legal = followers.length ? followers : hand;

  const cheapest = legal.reduce((b, c) => (valueOf(c) < valueOf(b) ? c : b));
  if (lead === -1) return cheapest; // leading: just dump the cheapest card

  let winning: Card | null = null;
  game.onTable.forEach((c) => {
    if (c && (winning === null || Game.beats(c, winning, trump, lead))) winning = c;
  });
  if (winning === null) return cheapest;
  const winCard: Card = winning;

  const winners = legal.filter((c) => Game.beats(c, winCard, trump, lead));
  if (winners.length) return winners.reduce((b, c) => (c.value < b.value ? c : b));
  return cheapest;
};

const GAMES = Number(process.argv[2] ?? 5000);

let botWins = 0;
let baseWins = 0;
let ties = 0;
let botPts = 0;
let basePts = 0;
let illegal = 0;

for (let g = 0; g < GAMES; g += 1) {
  const game = new Game();
  game.shufflePlayer = g % Game.numPlayers; // rotate the deal so no seat is favoured
  game.start();

  let guard = 0;
  while (guard < 400) {
    guard += 1;

    if (game.currPlayer === -1) {
      if (!game.decks[0].length && game.onTable.every((c) => c === null)) break;
      game.clearTable();
    } else {
      const seat = game.currPlayer;
      const pick = seat % 2 === 0 ? chooseCard : greedyBaseline;
      const card = pick(game, seat);
      if (!card) { illegal += 1; break; }

      if (game.play(seat, card) !== true) {
        illegal += 1;
        // Keep the game alive by playing any legal card instead.
        const fallback = game.decks[seat].find((c) => game.play(seat, c) === true);
        if (!fallback) break;
      }
    }
  }

  const [even, odd] = game.gameScore[game.gameScore.length - 1] ?? [0, 0];
  botPts += even;
  basePts += odd;
  if (even > odd) botWins += 1;
  else if (odd > even) baseWins += 1;
  else ties += 1;
}

const pct = (n: number) => ((100 * n) / GAMES).toFixed(1);

console.log(`Games played: ${GAMES} (deal rotated each game)\n`);
console.log(`Production bot wins: ${botWins} (${pct(botWins)}%)`);
console.log(`Greedy baseline wins: ${baseWins} (${pct(baseWins)}%)`);
console.log(`Ties: ${ties} (${pct(ties)}%)\n`);
console.log(`Avg points/game (of ${Game.maxPoints})  bot: ${(botPts / GAMES).toFixed(1)}   baseline: ${(basePts / GAMES).toFixed(1)}`);
console.log(`Illegal-move fallbacks: ${illegal}${illegal === 0 ? ' ✓' : '  <-- BUG: bot returned an illegal card'}`);
