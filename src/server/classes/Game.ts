import type { GameState, Score, Table } from '@/shared/GameTypes';
import { DenounceErrors, PlayErrors } from '@/shared/GameTypes';
import type { Card } from '../../shared/Card';
import { pointsOf, Suit } from '../../shared/Card';

const getRandom = (range: number) => Math.floor(Math.random() * range);

export default class Game {
  // Adjust this to 1 for a very fast game!
  static cardsPerPlayer = 10;

  static numPlayers = 4;

  static numTeams = 2;

  static maxPoints = 120; // +1 if the team wins all turns

  /** [even team, odd team] */
  roundScore: Score = [0, 0];

  gameScore: Score[] = [];

  /** stars as -1, switches to winnning team idx, until another teams wins an hand. Then it becomes numTeams */
  bandeira = -1;

  /** renounce */
  renounce: boolean[] = [false, false];

  /** each 'deck' corresponds to a player hand */
  decks: [Array<Card>, Array<Card>, Array<Card>, Array<Card>] = [[], [], [], []];

  /** every card played so far this game, in play order (used by bots to reason about what's left) */
  playedCards: Array<Card> = [];

  trump: Suit | `${Suit}` | null = null;

  trumpCard: Card | null = null;

  shufflePlayer: number = 0;

  currPlayer: number = -1;

  /** each Card is related by id to the player */
  onTable: Table = [null, null, null, null];

  /** the previous completed trick, indexed by player, kept so clients can show a history */
  lastTrick: Table = [null, null, null, null];

  tableSuit: Suit | `${Suit}` | null = null;

  /** completed tricks in the current game */
  tricksCompleted = 0;

  start() {
    this.roundScore = [0, 0];
    this.bandeira = -1;
    this.lastTrick = [null, null, null, null];
    this.tricksCompleted = 0;
    this.playedCards = [];
    this.renounce = [false, false, false, false];
    this.shuffleAndDistribute();
    this.chooseTrump();
    this.currPlayer = this.shufflePlayer;
  }

  play(player: number, card: Card, allowRenounce = false): PlayErrors | true {
    if (player !== this.currPlayer) {
      return PlayErrors.wrongTurn;
    }

    const { tableSuit } = this;
    let canAssist = false;
    let foundIdx = -1;

    this.decks[player].forEach((playerCard, cardIdx) => {
      if (playerCard.suit === tableSuit) {
        canAssist = true;
      }

      if ((card.value === playerCard.value) && (card.suit === playerCard.suit)) {
        foundIdx = cardIdx;
      }

      if (card.suit === this.trump && card.value === this.trumpCard?.value) {
        // We are playing the trump card... no more trump card
        this.trumpCard = null;
      }
    });

    if (foundIdx === -1) {
      return PlayErrors.invalidCard;
    }

    // First card of the round
    if (!this.tableSuit) {
      this.tableSuit = card.suit;
    }

    // One must always assist
    if ((card.suit !== this.tableSuit) && canAssist) {
      if (!allowRenounce) {
        return PlayErrors.mustAssist;
      }

      this.renounce[player] = true;
    }

    // From the hand to the table
    const played = this.decks[player].splice(foundIdx, 1)[0];
    this.onTable[player] = played;
    this.playedCards.push(played);

    if (this.onTable.findIndex((val) => val === null) !== -1) {
      // missing some cards on the table
      this.currPlayer = this.getNextPlayer();
    } else {
      // Everyone placed a card, let's see who wins
      this.currPlayer = -1;
    }
    return true;
  }

  getState(): GameState {
    return {
      trumpCard: this.trumpCard,
      table: this.onTable,
      lastTrick: this.lastTrick,
      currentPlayer: this.currPlayer,
      shufflePlayer: this.shufflePlayer,
      hands: this.decks.map((hand) => hand.length),
      tricksCompleted: this.tricksCompleted,
    };
  }

  /** The trump holder is the player right before whoever shuffled. */
  getTrumpHolder() {
    return this.getPreviousPlayer(this.shufflePlayer);
  }

  /**
   * After the first trick, the trump holder may pick their face-up trump card
   * into their hand so opponents can no longer see it. The card stays in their
   * deck the whole time; this only stops it being broadcast/shown face-up.
   */
  hideTrump(player: number): boolean {
    if (
      this.trumpCard === null
      || this.tricksCompleted < 1
      || player !== this.getTrumpHolder()
    ) {
      return false;
    }

    this.trumpCard = null;
    return true;
  }

  clearTable() {
    let winnerId = 0;
    let points = 0;
    let winningCard = this.onTable[0];

    this.onTable.forEach((card, playerIdx) => {
      if (card === null || winningCard === null) {
        throw new Error('You stupid piece of shit! No nulls can reach here!');
      }

      points += pointsOf(card);

      if (this.isBiggerThan(card, winningCard)) {
        winningCard = card;
        winnerId = playerIdx;
      }
    });

    const winnerTeam = winnerId % Game.numTeams;

    if (this.bandeira === -1) {
      this.bandeira = winnerTeam;
    } else if (this.bandeira !== winnerTeam) {
      this.bandeira = Game.numTeams;
    }

    this.roundScore[winnerTeam] += points;

    // Keep a snapshot of this trick so clients can show a history of the last one
    this.lastTrick = [...this.onTable];
    this.tricksCompleted++;

    // Reset the table
    this.resetTable();

    if (!this.decks[0].length) {
      this.end();
    } else {
      // The player that wins is the first to play
      this.currPlayer = winnerId;
    }
  }

  resetTable() {
    this.tableSuit = null;
    this.onTable = [null, null, null, null];
  }

  isEnded() {
    return this.currPlayer === -1 && !this.decks[0].length;
  }

  denounce(playerIdx: number, denounceIdx: number): boolean | DenounceErrors {
    if (playerIdx % Game.numTeams === denounceIdx % Game.numTeams) {
      return DenounceErrors.sameTeam;
    }

    const score: Score = [0, 0];

    // You are wrong - Lose 1 Game and keep playing
    if (!this.renounce[denounceIdx]) {
      score[playerIdx % Game.numTeams] = 50;
      score[denounceIdx % Game.numTeams] = Game.maxPoints - 50;
      this.gameScore.push(score);
      return false;
    }

    // You are right - Win 4 Games
    this.roundScore = [0, 0];
    this.bandeira = playerIdx % Game.numTeams;
    this.roundScore[playerIdx % Game.numTeams] = Game.maxPoints;
    this.end();

    return true;
  }

  // --------------- Private Methods --------------- //

  private shuffleAndDistribute() {
    const deck = Game.getFullDeck();

    // Fisher-Yates: unbiased in-place shuffle of the whole deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = getRandom(i + 1);
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    // Deal the shuffled deck out in equal, contiguous chunks
    deck.forEach((card, idx) => {
      this.decks[Math.floor(idx / Game.cardsPerPlayer)].push(card);
    });
  }

  private getNextPlayer(player = this.currPlayer) {
    if (player === Game.numPlayers - 1) {
      return 0;
    }

    return player + 1;
  }

  private getPreviousPlayer(player = this.currPlayer) {
    if (player === 0) {
      return Game.numPlayers - 1;
    }

    return player - 1;
  }

  private chooseTrump() {
    this.trumpCard = this.decks[this.getPreviousPlayer(this.shufflePlayer)][getRandom(Game.cardsPerPlayer)];
    this.trump = this.trumpCard.suit;
  }

  /**
   * Trick-comparison rule shared by the engine and the bot: does `challenger`
   * beat `best`, given the trump suit and the suit that was led? Suits are
   * coerced to numbers so it works with either card-suit representation.
   */
  static beats(challenger: Card, best: Card, trump: number, tableSuit: number): boolean {
    const cs = Number(challenger.suit);
    const bs = Number(best.suit);

    if (cs === bs) return challenger.value > best.value;
    if (cs === trump) return true;
    if (cs === tableSuit && bs !== trump) return true;
    return false;
  }

  private isBiggerThan(card1: Card, card2: Card): boolean {
    return Game.beats(card1, card2, Number(this.trump), Number(this.tableSuit));
  }

  private end() {
    // end game no one can play
    this.currPlayer = -1;
    // all cards go away
    this.decks = [[], [], [], []];
    // The table is cleaned
    this.resetTable();

    // Check for "bandeira"
    let i = 0;
    while (i < Game.numTeams) {
      if (this.roundScore[i] === Game.maxPoints && this.bandeira === i) {
        this.roundScore[i]++;
      }
      i++;
    }

    this.gameScore.push(this.roundScore);
    this.shufflePlayer = this.getNextPlayer(this.shufflePlayer);
  }

  // -------------- Private Static Methods -------------- //

  // eslint-disable-next-line class-methods-use-this
  private static getFullDeck() {
    const fulldeck: Array<Card> = [];

    [Suit.Diamonds, Suit.Spades, Suit.Hearts, Suit.Clubs].forEach((suit) => {
      let i: number = Game.cardsPerPlayer;
      while (i) {
        fulldeck.push({
          suit,
          value: i,
        });

        i--;
      }
    });

    return fulldeck;
  }
}
