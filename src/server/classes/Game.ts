import type { GameState, Table } from '@/shared/GameTypes';
import type { Card } from '../../shared/Card';
import { pointsOf, Suit } from '../../shared/Card';

const getFullDeck = () => {
  const fulldeck: Array<Card> = [];

  [Suit.diamond, Suit.spades, Suit.hearts, Suit.clubs].forEach((suit) => {
    let i: number = 10;
    while (i) {
      fulldeck.push({
        suit,
        value: i,
      });

      i--;
    }
  });

  return fulldeck;
};

const getRandom = (range: number) => Math.floor(Math.random() * range);

export default class Game {
  score: [number, number] = [0, 0];

  /** each 'deck' corresponds to a player hand */
  decks: [Array<Card>, Array<Card>, Array<Card>, Array<Card>] = [[], [], [], []];

  trump: Suit | `${Suit}` | null = null;

  trumpCard: Card | null = null;

  shufflePlayer: number = 0;

  currPlayer: number = -1;

  /** each Card is related by id to the player */
  onTable: Table = [null, null, null, null];

  tableSuit: Suit | `${Suit}` | null = null;

  start() {
    this.shuffleAndDistribute();
    this.chooseTrump();
    this.currPlayer = this.shufflePlayer;
  }

  play(player: number, card: Card): boolean {
    if (player !== this.currPlayer) {
      return false;
    }

    const { tableSuit } = this;
    let canAssist = false;
    let foundIdx = -1;

    this.decks[player].forEach((playerCard, cardIdx) => {
      if (playerCard.suit === tableSuit) {
        canAssist = true;
      }

      if (card.value === playerCard.value && card.suit === playerCard.suit) {
        foundIdx = cardIdx;
      }
    });

    if (foundIdx === -1) {
      return false;
    }

    // First card of the round
    if (!this.tableSuit) {
      this.tableSuit = card.suit;
    }

    // One must always assist
    if (card.suit !== this.tableSuit && canAssist) {
      return false;
    }

    // From the hand to the table
    this.onTable[player] = this.decks[player].splice(foundIdx, 1)[0];

    if (this.onTable.findIndex((val) => val === null) !== -1) {
      // missing some cards on the table
      this.currPlayer = this.getNextPlayer();
    } else {
      // Everyone placed a card, let's see who wins
      this.clearTable();
    }
    return true;
  }

  getState(): GameState {
    return {
      trumpCard: this.trumpCard,
      table: this.onTable,
      currentPlayer: this.currPlayer,
      shufflePlayer: this.shufflePlayer,
      hands: this.decks.map((hand) => hand.length),
    };
  }

  // --------------- Private Methods --------------- //

  private shuffleAndDistribute() {
    getFullDeck().forEach(this.addCardRandom.bind(this));
  }

  private addCardRandom(card: Card): void {
    const playerNum = getRandom(4);

    if (this.decks[playerNum].length > 9) {
      this.addCardRandom(card);
      return;
    }

    this.decks[playerNum].push(card);
  }

  private getNextPlayer(player = this.currPlayer) {
    if (player === 3) {
      return 0;
    }

    return player + 1;
  }

  private getPreviousPlayer(player = this.currPlayer) {
    if (player === 0) {
      return 3;
    }

    return player - 1;
  }

  private chooseTrump() {
    this.trumpCard = this.decks[this.getPreviousPlayer(this.shufflePlayer)][getRandom(10)];
    this.trump = this.trumpCard.suit;
  }

  private clearTable() {
    const { isBiggerThan } = this;
    let winnerId = 0;
    let points = 0;
    let winningCard = this.onTable[0];

    this.onTable.forEach((card, playerIdx) => {
      if (card === null || winningCard === null) {
        throw new Error('You stupid piece of shit! No nulls can reach here!');
      }

      points += pointsOf(card);

      if (isBiggerThan(card, winningCard)) {
        winningCard = card;
        winnerId = playerIdx;
      }
    });

    this.score[winnerId % 2] += points;

    // Reset the table
    this.tableSuit = null;
    this.onTable = [null, null, null, null];

    if (!this.decks[0].length) {
      this.end();
    } else {
      // The player that wins is the first to play
      this.currPlayer = winnerId;
    }
  }

  private isBiggerThan(card1: Card, card2: Card): boolean {
    if (card1.suit === card2.suit) {
      return card1.value > card2.value;
    }

    if (card1.suit === this.trump) {
      return true;
    }

    if (card1.suit === this.tableSuit && card2.suit !== this.trump) {
      return true;
    }

    return false;
  }

  private end() {
    // end game no one can play
    this.currPlayer = -1;
  }
}
