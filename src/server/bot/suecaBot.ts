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
 */

const CARDS_PER_SUIT = 10;

const suitOf = (card: Card) => Number(card.suit);

type Play = { card: Card; idx: number };

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

/** Trumps still held by the other three players. */
const trumpsOutstanding = (game: Game, myIdx: number, trump: number): number => {
  const mine = game.decks[myIdx].filter((c) => suitOf(c) === trump).length;
  const played = game.playedCards.filter((c) => suitOf(c) === trump).length;
  return CARDS_PER_SUIT - mine - played;
};

/** Opening lead when the bot is first to play the trick. */
const chooseLead = (game: Game, myIdx: number, hand: Card[], trump: number): Card => {
  const myTrumps = hand.filter((c) => suitOf(c) === trump);
  const sideCards = hand.filter((c) => suitOf(c) !== trump);
  const bossSide = sideCards.filter((c) => higherOutstanding(game, myIdx, c) === 0);
  const trumpsOut = trumpsOutstanding(game, myIdx, trump);

  // No trumps left with anyone else: guaranteed side-suit winners can be cashed
  // safely, so grab the most valuable one.
  if (trumpsOut <= 0 && bossSide.length) {
    return richest(bossSide);
  }

  // Long in trump: lead a low trump to draw the opponents' trumps out and
  // protect our side-suit winners.
  if (myTrumps.length >= 4) {
    return lowestValue(myTrumps);
  }

  // A side-suit boss (typically an Ace) is worth cashing while the ruff risk is
  // still low.
  if (bossSide.length && trumpsOut <= 3) {
    return richest(bossSide);
  }

  // Otherwise probe: lead the cheapest card of our longest side suit, keeping
  // high cards and points back.
  if (sideCards.length) {
    const bySuit = new Map<number, Card[]>();
    sideCards.forEach((c) => {
      const s = suitOf(c);
      const bucket = bySuit.get(s);
      if (bucket) bucket.push(c);
      else bySuit.set(s, [c]);
    });

    let longest: Card[] = [];
    bySuit.forEach((cards) => {
      if (cards.length > longest.length) longest = cards;
    });

    return cheapestDiscard(longest);
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
): Card => {
  if (partnerWinning) {
    // The trick looks safe if we play last, or the partner's card can't be
    // beaten by suit and there is no trump left to ruff it.
    const winSuitIsTrump = suitOf(winningCard) === trump;
    const safe = iAmLast
      || (higherOutstanding(game, myIdx, winningCard) === 0
        && (winSuitIsTrump || trumpsOutstanding(game, myIdx, trump) === 0));

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
    // later (a boss), unless there are enough points to gamble for.
    const bossWinners = winningOptions.filter((c) => higherOutstanding(game, myIdx, c) === 0);
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
): Card => {
  const trumps = legal.filter((c) => suitOf(c) === trump);
  const nonTrumps = legal.filter((c) => suitOf(c) !== trump);

  if (partnerWinning) {
    // Feed points to the partner with a side card, keeping trumps back.
    const safe = iAmLast || higherOutstanding(game, myIdx, winningCard) === 0;
    return feedOrDump(nonTrumps.length ? nonTrumps : legal, safe);
  }

  // Opponent winning: ruff a worthwhile trick with the cheapest trump that beats
  // the current winner.
  const cuttingTrumps = trumps.filter((c) => Game.beats(c, winningCard, trump, -1));
  if (cuttingTrumps.length && (iAmLast || trickPoints >= 10)) {
    return lowestValue(cuttingTrumps);
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

  const plays: Play[] = [];
  game.onTable.forEach((card, idx) => {
    if (card) plays.push({ card, idx });
  });

  // Leading the trick.
  if (plays.length === 0) {
    return chooseLead(game, myIdx, hand, trump);
  }

  const winner = currentWinner(plays, trump, lead);
  const partnerWinning = winner.idx === partner;
  const iAmLast = plays.length === Game.numPlayers - 1;
  const trickPoints = plays.reduce((sum, p) => sum + pointsOf(p.card), 0);

  return canFollow
    ? chooseFollow(game, myIdx, legal, winner.card, partnerWinning, iAmLast, trickPoints, trump, lead)
    : chooseVoid(game, myIdx, legal, winner.card, partnerWinning, iAmLast, trickPoints, trump);
};
