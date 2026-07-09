import type { Score } from '@/shared/GameTypes';

export type TeamStat = {
  /** number of games (deals) this team won */
  gamesWon: number;
  /** accumulated match points ("vales": 1 = simples, 2 = dobrada, 4 = bandeira) */
  vales: number;
  /** total card points scored across every game */
  cardPoints: number;
};

export type MatchStats = {
  /** [even team (players 0 & 2), odd team (players 1 & 3)] */
  teams: [TeamStat, TeamStat];
  gamesPlayed: number;
};

/**
 * How many match points ("vales") a card-point total is worth for its team.
 * Mirrors the thresholds used by `bestOfThree` so the stats agree with the pad:
 * >120 = bandeira (4), >90 = dobrada (2), >60 = simples (1), otherwise a loss/tie.
 */
export const valesFor = (points: number): number => {
  if (points > 120) return 4;
  if (points > 90) return 2;
  if (points > 60) return 1;
  return 0;
};

export const computeMatchStats = (results: Score[]): MatchStats => {
  const teams: [TeamStat, TeamStat] = [
    { gamesWon: 0, vales: 0, cardPoints: 0 },
    { gamesWon: 0, vales: 0, cardPoints: 0 },
  ];

  results.forEach(([even, odd]) => {
    teams[0].cardPoints += even;
    teams[1].cardPoints += odd;

    const evenVales = valesFor(even);
    const oddVales = valesFor(odd);

    if (evenVales > 0) {
      teams[0].gamesWon += 1;
      teams[0].vales += evenVales;
    } else if (oddVales > 0) {
      teams[1].gamesWon += 1;
      teams[1].vales += oddVales;
    }
    // a 60-60 tie awards nothing to either team
  });

  return { teams, gamesPlayed: results.length };
};
