import { pointsOf, type Card } from '@/shared/Card';

import Game from '../classes/Game';

/**
 * A rule-based Sueca bot. It only ever reads information a fair human player
 * could know (its own hand, the cards on the table, the trump suit, and the
 * cards already played this game) and returns a legal card to play.
 *
 * The engine (`Game.play`) enforces the "must assist" rule; this module makes
 * sure the bot always follows it, then layers strategy on top: winning tricks
 * cheaply, feeding points to a winning partner, ruffing valuable tricks, and
 * conserving trumps and high cards otherwise.
 *
 * On top of raw card counting it reconstructs, from the public play history,
 * which players have shown themselves *void* in a suit (they failed to follow
 * it). That is exactly the mental note a strong human keeps — "conta o jogo" —
 * and it drives the sharper decisions: only cashing an Ace/7 when it truly
 * can't be ruffed, leading a suit the partner can cut, and telling a genuinely
 * safe trick from one an opponent can still steal.
 */

const CARDS_PER_SUIT = 10;

const suitOf = (card: Card) => Number(card.suit);

type Play = { card: Card; idx: number };

/** The two opponents of the seat at `myIdx` (the other team). */
const opponentsOf = (myIdx: number) => [
  (myIdx + 1) % Game.numPlayers,
  (myIdx + 3) % Game.numPlayers,
];

/** The play currently winning the trick (highest under `Game.beats`). */
const currentWinner = (plays: Play[], trump: number, lead: number): Play => (
  plays.reduce((best, p) => (Game.beats(p.card, best.card, trump, lead) ? p : best))
);

/** Single-pass min/max — cheaper and clearer than sorting to read one element. */
const minBy = (cards: Card[], score: (c: Card) => number): Card => (
  cards.reduce((best, c) => (score(c) < score(best) ? c : best))
);
const maxBy = (cards: Card[], score: (c: Card) => number): Card => (
  cards.reduce((best, c) => (score(c) > score(best) ? c : best))
);

/**
 * How much we value a card: points first, then rank. High = most valuable to
 * feed a winning partner; low = cheapest to throw away.
 */
const cardScore = (c: Card) => pointsOf(c) * 100 + c.value;

const lowestValue = (cards: Card[]) => minBy(cards, (c) => c.value);
const cheapestDiscard = (cards: Card[]) => minBy(cards, cardScore);
const richest = (cards: Card[]) => maxBy(cards, cardScore);

/** Feed points to a winning partner when safe, otherwise conserve them. */
const feedOrDump = (pool: Card[], safe: boolean) => (safe ? richest(pool) : cheapestDiscard(pool));

/** A card carrying real points (Ace = 11 or 7 = 10) is expensive to lose. */
const isBigPoint = (c: Card) => pointsOf(c) >= 10;

/**
 * Per-seat set of suits a player is *known* to be void in, reconstructed from
 * the public play history. Play order is deterministic: the shuffler leads the
 * first trick and the winner of each trick leads the next, so every card in
 * `game.playedCards` can be attributed to a seat, and any card that doesn't
 * follow the suit that was led proves that seat is void in it.
 */
const reconstructVoids = (game: Game): Set<number>[] => {
  const voids: Set<number>[] = [new Set(), new Set(), new Set(), new Set()];
  const trump = Number(game.trump);
  const { playedCards } = game;
  let leader = game.shufflePlayer;

  for (let t = 0; t < game.tricksCompleted; t += 1) {
    const start = t * Game.numPlayers;
    const cards = playedCards.slice(start, start + Game.numPlayers);
    if (cards.length < Game.numPlayers) break;

    const trickLeader = leader;
    const ledSuit = suitOf(cards[0]);
    let winnerCard = cards[0];
    let winnerSeat = trickLeader;

    cards.forEach((card, k) => {
      const seat = (trickLeader + k) % Game.numPlayers;
      if (suitOf(card) !== ledSuit) voids[seat].add(ledSuit);
      if (k > 0 && Game.beats(card, winnerCard, trump, ledSuit)) {
        winnerCard = card;
        winnerSeat = seat;
      }
    });

    leader = winnerSeat;
  }

  // Cards already down in the current, in-progress trick are attributed by their
  // table seat directly — no reconstruction needed.
  if (game.tableSuit !== null) {
    const ledSuit = Number(game.tableSuit);
    game.onTable.forEach((card, seat) => {
      if (card && suitOf(card) !== ledSuit) voids[seat].add(ledSuit);
    });
  }

  return voids;
};

/**
 * How many still-unseen cards of `card`'s suit outrank it. Zero means the card
 * is the highest of its suit that can still appear — a "boss" — though a boss
 * of a side suit can still be ruffed by a void opponent's trump.
 *
 * On-table cards are already in `playedCards` (pushed when played), so the
 * table does not need a separate scan.
 */
const higherOutstanding = (game: Game, myIdx: number, card: Card): number => {
  const suit = suitOf(card);
  const seen = new Set<number>();
  const note = (c: Card | null) => {
    if (c && suitOf(c) === suit) seen.add(c.value);
  };

  game.playedCards.forEach(note);
  game.decks[myIdx].forEach(note);

  let count = 0;
  for (let v = card.value + 1; v <= CARDS_PER_SUIT; v += 1) {
    if (!seen.has(v)) count += 1;
  }
  return count;
};

/** Cards of `suit` still held by the other three players (unseen by us). */
const suitOutstanding = (game: Game, myIdx: number, suit: number): number => {
  const mine = game.decks[myIdx].filter((c) => suitOf(c) === suit).length;
  const played = game.playedCards.filter((c) => suitOf(c) === suit).length;
  return CARDS_PER_SUIT - mine - played;
};

/** Trumps still held by the other three players. */
const trumpsOutstanding = (game: Game, myIdx: number, trump: number): number => (
  suitOutstanding(game, myIdx, trump)
);

/**
 * Can a lead in `suit` still be ruffed away by one of `opponents`? Only if
 * trumps remain out there and some listed opponent is known void in the suit.
 * A trump lead can never be ruffed. When an opponent's void is unknown we
 * assume they can still follow (the optimistic-but-fair default).
 */
const ruffableBy = (
  game: Game,
  myIdx: number,
  suit: number,
  trump: number,
  voids: Set<number>[],
  opponents: number[],
): boolean => {
  if (suit === trump) return false;
  if (trumpsOutstanding(game, myIdx, trump) <= 0) return false;
  return opponents.some((o) => voids[o].has(suit));
};

/**
 * Would leading `card` now be a guaranteed trick win? It must be the boss of
 * its suit and, if it is a side suit, no opponent able to ruff it.
 */
const guaranteedIfLed = (
  game: Game,
  myIdx: number,
  card: Card,
  trump: number,
  voids: Set<number>[],
): boolean => {
  if (higherOutstanding(game, myIdx, card) > 0) return false;
  const suit = suitOf(card);
  if (suit === trump) return true;
  return !ruffableBy(game, myIdx, suit, trump, voids, opponentsOf(myIdx));
};

/**
 * Is the current winning card safe from here on — nobody left to play can beat
 * it? Safe when we play last, or it is the unbeaten boss of its suit and (being
 * a top trump, or a side card no remaining opponent can ruff) can't be cut.
 */
const winnerIsSafe = (
  game: Game,
  myIdx: number,
  winningCard: Card,
  ledSuit: number,
  trump: number,
  voids: Set<number>[],
  remainingOpponents: number[],
  iAmLast: boolean,
): boolean => {
  if (iAmLast) return true;
  if (higherOutstanding(game, myIdx, winningCard) > 0) return false;
  if (suitOf(winningCard) === trump) return true;
  return !ruffableBy(game, myIdx, ledSuit, trump, voids, remainingOpponents);
};

/** Opening lead when the bot is first to play the trick. */
const chooseLead = (
  game: Game,
  myIdx: number,
  hand: Card[],
  trump: number,
  voids: Set<number>[],
): Card => {
  const myTrumps = hand.filter((c) => suitOf(c) === trump);
  const sideCards = hand.filter((c) => suitOf(c) !== trump);
  const trumpsOut = trumpsOutstanding(game, myIdx, trump);
  const partner = (myIdx + 2) % Game.numPlayers;

  const guaranteedSide = sideCards.filter((c) => guaranteedIfLed(game, myIdx, c, trump, voids));

  // Cash a guaranteed points winner (an unbeatable, unruffable Ace/7) to bank
  // the points while we still can — provided opponents look able to follow
  // (someone else still holds the suit) or no trumps remain to cut it with.
  const richGuaranteed = guaranteedSide.filter(
    (c) => isBigPoint(c) && (trumpsOut <= 0 || suitOutstanding(game, myIdx, suitOf(c)) >= 2),
  );
  if (richGuaranteed.length) return richest(richGuaranteed);

  // Long in trump: lead a low trump to draw the opponents' trumps out and
  // protect our side-suit winners.
  if (myTrumps.length >= 4 && trumpsOut > 0) {
    return lowestValue(myTrumps);
  }

  // No trumps left with anyone else: every guaranteed side winner is money in
  // the bank, so grab the most valuable one.
  if (trumpsOut <= 0 && guaranteedSide.length) {
    return richest(guaranteedSide);
  }

  // Set up a partner ruff: the partner is void in a side suit and trumps are
  // still out, so lead our cheapest card of that suit and let them cut it.
  if (trumpsOut > 0) {
    const ruffFeed = sideCards.filter((c) => voids[partner].has(suitOf(c)));
    if (ruffFeed.length) return cheapestDiscard(ruffFeed);
  }

  // Otherwise probe: lead the cheapest card of our longest side suit, but
  // prefer a suit no opponent is void in so the lead can't simply be ruffed
  // away. Keeps high cards and points back.
  if (sideCards.length) {
    const opps = opponentsOf(myIdx);
    const bySuit = new Map<number, Card[]>();
    sideCards.forEach((c) => {
      const s = suitOf(c);
      const bucket = bySuit.get(s);
      if (bucket) bucket.push(c);
      else bySuit.set(s, [c]);
    });

    let best: Card[] = [];
    let bestSafe = false;
    bySuit.forEach((cards, suit) => {
      const safe = !opps.some((o) => voids[o].has(suit));
      const better = (safe && !bestSafe) || (safe === bestSafe && cards.length > best.length);
      if (better || best.length === 0) {
        best = cards;
        bestSafe = safe;
      }
    });

    return cheapestDiscard(best);
  }

  // Only trumps in hand.
  return lowestValue(myTrumps);
};

/** We can follow the led suit; every card in `legal` is of that suit. */
const chooseFollow = (
  game: Game,
  myIdx: number,
  legal: Card[],
  winningCard: Card,
  partnerWinning: boolean,
  iAmLast: boolean,
  trickPoints: number,
  trump: number,
  lead: number,
  voids: Set<number>[],
  remainingOpponents: number[],
): Card => {
  if (partnerWinning) {
    const safe = winnerIsSafe(game, myIdx, winningCard, lead, trump, voids, remainingOpponents, iAmLast);

    // Never overtake our own partner; feed from the rest.
    const nonOvertaking = legal.filter((c) => !Game.beats(c, winningCard, trump, lead));
    return feedOrDump(nonOvertaking.length ? nonOvertaking : legal, safe);
  }

  // An opponent is winning.
  const winningOptions = legal.filter((c) => Game.beats(c, winningCard, trump, lead));

  if (winningOptions.length) {
    if (iAmLast) {
      // We close the trick: win it as cheaply as possible.
      return lowestValue(winningOptions);
    }

    // Someone still plays after us. Only commit a winner that can't be beaten
    // later — the boss of the suit, and one no remaining opponent can ruff —
    // unless there are enough points to gamble for.
    const bossWinners = winningOptions.filter(
      (c) => higherOutstanding(game, myIdx, c) === 0
        && !ruffableBy(game, myIdx, lead, trump, voids, remainingOpponents),
    );
    if (bossWinners.length) return lowestValue(bossWinners);
    if (trickPoints >= 10) return lowestValue(winningOptions);
    return cheapestDiscard(legal);
  }

  // Can't win: throw the cheapest card.
  return cheapestDiscard(legal);
};

/** We are void in the led suit, so we may discard or ruff. */
const chooseVoid = (
  game: Game,
  myIdx: number,
  legal: Card[],
  winningCard: Card,
  partnerWinning: boolean,
  iAmLast: boolean,
  trickPoints: number,
  trump: number,
  lead: number,
  voids: Set<number>[],
  remainingOpponents: number[],
): Card => {
  const trumps = legal.filter((c) => suitOf(c) === trump);
  const nonTrumps = legal.filter((c) => suitOf(c) !== trump);

  if (partnerWinning) {
    // Feed points to the partner with a side card, keeping trumps back.
    const safe = winnerIsSafe(game, myIdx, winningCard, lead, trump, voids, remainingOpponents, iAmLast);
    return feedOrDump(nonTrumps.length ? nonTrumps : legal, safe);
  }

  // Opponent winning: ruff a worthwhile trick with the cheapest trump that beats
  // the current winner.
  const cuttingTrumps = trumps.filter((c) => Game.beats(c, winningCard, trump, -1));
  if (cuttingTrumps.length) {
    if (iAmLast) return lowestValue(cuttingTrumps);

    // Players remain after us: ruffing with a beatable trump risks being
    // over-ruffed and losing the trump for nothing. Only cut a fat trick, and
    // then only with a trump no one can top.
    if (trickPoints >= 10) {
      const topRuffs = cuttingTrumps.filter((c) => higherOutstanding(game, myIdx, c) === 0);
      if (topRuffs.length) return lowestValue(topRuffs);
    }
  }

  // Not worth trumping (or we can't beat it): discard the cheapest side card and
  // preserve our trumps.
  return cheapestDiscard(nonTrumps.length ? nonTrumps : legal);
};

/**
 * Pick a card for the bot sitting at seat `myIdx`. Returns a card that exists in
 * the bot's hand, or `null` when the hand is empty (should not happen on a turn).
 */
export const chooseCard = (game: Game, myIdx: number): Card | null => {
  const hand = game.decks[myIdx];
  if (!hand.length) return null;

  const trump = Number(game.trump);
  // -1 means "no suit led yet" (we are leading); no real card matches it.
  const lead = game.tableSuit === null ? -1 : Number(game.tableSuit);
  const partner = (myIdx + 2) % Game.numPlayers;

  // Legal moves: must follow the led suit when we hold it.
  const followers = hand.filter((c) => suitOf(c) === lead);
  const canFollow = followers.length > 0;
  const legal = canFollow ? followers : hand;
  if (legal.length === 1) return legal[0];

  const voids = reconstructVoids(game);

  const plays: Play[] = [];
  game.onTable.forEach((card, idx) => {
    if (card) plays.push({ card, idx });
  });

  // Leading the trick.
  if (plays.length === 0) {
    return chooseLead(game, myIdx, hand, trump, voids);
  }

  const winner = currentWinner(plays, trump, lead);
  const partnerWinning = winner.idx === partner;
  const iAmLast = plays.length === Game.numPlayers - 1;
  const trickPoints = plays.reduce((sum, p) => sum + pointsOf(p.card), 0);
  // Opponents who have not played yet are the only ones who can still hurt us.
  const remainingOpponents = opponentsOf(myIdx).filter((o) => game.onTable[o] === null);

  return canFollow
    ? chooseFollow(
      game,
      myIdx,
      legal,
      winner.card,
      partnerWinning,
      iAmLast,
      trickPoints,
      trump,
      lead,
      voids,
      remainingOpponents,
    )
    : chooseVoid(
      game,
      myIdx,
      legal,
      winner.card,
      partnerWinning,
      iAmLast,
      trickPoints,
      trump,
      lead,
      voids,
      remainingOpponents,
    );
};
