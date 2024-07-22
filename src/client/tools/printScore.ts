import type { Score } from '@/shared/GameTypes';

export type ScoreLines = {
  top: string;
  middleTop: string;
  middle: string;
  middleBottom: string;
  bottom: string;
};

export const bestOfThree = (results: Score[], team: boolean = false): ScoreLines => {
  let nScore = '|\\ | |  ';
  let niddle = '| \\| |  ';
  let line = '--------';
  let viddle = '\\  / |  ';
  let vScore = ' \\/  |  ';

  let nWins = 0;
  let vWins = 0;
  let nBigWins = 0;
  let vBigWins = 0;

  const closeWin = (s: string, w: number) => `${s.substring(0, s.length - 1 - (w * 2))}<${w ? s.substring(s.length - (w * 2), s.length - 1).replaceAll(' ', '-') : ''}${w === 0 ? '-----' : '-'.repeat((3 - w) * 2)}>   `;
  const closeLost = (s: string, w: number) => `${s}${'  '.repeat((3 - w))}   `;
  const closeMiddle = () => {
    niddle += '| | |    ';
    viddle += '| | |    ';
    line += '+-+-+----';
  };

  const close = (ourWin: boolean) => {
    nScore = ourWin ? closeWin(nScore, nWins) : closeLost(nScore, nWins);
    vScore = ourWin ? closeLost(vScore, vWins) : closeWin(vScore, vWins);
    closeMiddle();
    nWins = 0;
    vWins = 0;
    nBigWins += ourWin ? 1 : 0;
    vBigWins += !ourWin ? 1 : 0;
    if ((ourWin ? nBigWins : vBigWins) > 1) {
      nBigWins = 0;
      vBigWins = 0;
      nScore += '          ';
      niddle += '  \\ /     ';
      line += '---X------';
      viddle += '  / \\     ';
      vScore += '          ';
    }
  };

  results.forEach((score) => {
    const ourScore = score[team ? 1 : 0];
    const yourScore = score[team ? 0 : 1];
    if (ourScore > 120) { // We gain 4 points
      close(true);
    } else if (ourScore > 90) { // We gain 2 points
      if (nWins >= 2) {
        close(true);
      } else {
        nScore += '<-> ';
        nWins += 2;
      }
    } else if (ourScore > 60) { // We gain 1 point
      if (nWins >= 3) {
        close(true);
      } else {
        nScore += 'o ';
        nWins += 1;
      }
    } else if (ourScore === 60) { // It's a tie
      // Do nothing
    } else if (ourScore >= 30) { // They gain 1 point
      if (vWins >= 3) {
        close(false);
      } else {
        vScore += 'o ';
        vWins += 1;
      }
    } else if (ourScore > 0 || yourScore === 120) { // They gain 2 points
      if (vWins >= 2) {
        close(false);
      } else {
        vScore += '<-> ';
        vWins += 2;
      }
    } else { // They gain 4 points
      // são 4
      close(false);
    }
  });

  // finish the drawing
  if (nWins || vWins) {
    closeMiddle();
  }

  return {
    top: nScore,
    middleTop: niddle,
    middle: line,
    middleBottom: viddle,
    bottom: vScore,
  };
};
