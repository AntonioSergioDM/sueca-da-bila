# Making the Sueca bot smarter — 2026-07-11

Reworked `src/server/bot/suecaBot.ts` from a rank/trump counter into a bot that
also tracks **voids** (who has shown themselves unable to follow a suit). Added a
permanent benchmark at `src/server/bot/sim.ts` (`npm run bot:sim`).

## Sueca strategy that actually matters (from research + rules)

- **40-card deck, 4 players, 2 teams** (partners sit opposite: even team = seats
  0 & 2, odd = 1 & 3). Must follow the led suit if you can ("assistir").
- **Card values (points):** Ace = 11, 7 = 10, King = 4, Jack = 3, Queen = 2,
  rest = 0. 120 total per game; >60 wins. Note the engine's `value` field is a
  **rank index 1–10, not the printed rank** (10=Ace, 9=7/"manilha", 8=K, 7=J,
  6=Q). Always go through `pointsOf`/`Card.beats`.
- **Trump ("trunfo") beats any side suit** — even the 2 of trump beats the Ace of
  another suit. Knowing when to spend vs. hold trumps is most of the skill.
- **"Conta o jogo" (count the game):** strong players track not just which cards
  are gone but **which players are void in which suits**. This is the single
  biggest edge and what the old bot lacked.
- **Ace/7 are expensive to lose** — cash them only when they can't be ruffed;
  don't throw them away early.
- **Set up partner ruffs:** lead a suit your partner is void in so they can cut
  it for points. Conversely, **don't lead into an opponent's void** (they trump
  it away).
- **Destrunfar (draw trumps):** when long in trump, lead low trumps to strip the
  opponents' trumps and protect your side-suit winners.
- No table talk / signals allowed — all "communication" is through legal card
  choices.

## The key technique: reconstructing voids without engine changes

The engine (`Game`) only keeps `playedCards` as a flat, in-play-order list — no
per-player history. But play order is deterministic:

- Trick 1's leader is `game.shufflePlayer`.
- Each later trick is led by the **winner of the previous trick**.

So `reconstructVoids()` walks `playedCards` in chunks of 4, attributes each card
to a seat via `(trickLeader + k) % 4`, recomputes the winner with `Game.beats`
to find the next leader, and records a void whenever a seat played off the led
suit. The in-progress trick is read directly from `game.onTable` (seat = index).
**No engine change, no hidden information** — exactly what a fair human tracks.

That void map powers: `guaranteedIfLed` / `ruffableBy` (only cash an Ace/7 that
truly can't be ruffed), partner-ruff leads, avoiding leading into opponent voids,
`winnerIsSafe` (feed a partner only when no *remaining* opponent can still ruff),
and only ruffing with an un-over-ruffable trump when players remain behind you.

## Benchmark

`npm run bot:sim [games]` — production bot (even) vs. a naive greedy baseline
(odd). Deal rotates each game; `Illegal-move fallbacks` must stay 0 (doubles as a
correctness check). Uses `tsx` (added as a devDependency) with tsconfig paths.

Result of the rework (measured new-vs-previous over 8000 games before replacing
the old code): **~53% win rate, ~62 vs ~58 pts/game, 0 illegal moves** across
~160k plays. Re-run vs. the greedy baseline to see the current margin.

## Gotchas / notes

- There is **no test suite**; `npm run errors` (tsc + eslint) + `bot:sim` are the
  verification gates.
- `sim.ts` lives under `src/` so tsc/eslint check it, but it's a standalone
  script (never imported by a page) so it's not in the Next bundle.
- If a human uses the renúncia rule (plays off-suit while holding the suit),
  void inference will be wrong for that seat — acceptable edge case; bots never
  renounce.
