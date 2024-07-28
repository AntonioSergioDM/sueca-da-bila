import { useMemo } from 'react';

import { Paper, Typography } from '@mui/material';

import { bestOfThree } from '@/client/tools/printScore';

import { useGamePlayer, useGameScore } from '../redux/store';

const ScorePad = () => {
  const { index } = useGamePlayer()!; // if we are in FramerGame, there should be a player state
  const score = useGameScore();

  const text = useMemo(() => bestOfThree(score, index % 2 === 1), [score, index]);

  return (
    <div className="fixed bottom-0 left-0 bg-amber-800">
      <Paper elevation={5} className="p-2 flex flex-col gap-0 font-mono bg-white overflow-x-auto rounded-md w-full">
        <Typography style={{ whiteSpace: 'pre' }} className="font-mono text-black text-xxxs">{text.top}</Typography>
        <Typography style={{ whiteSpace: 'pre' }} className="font-mono text-black text-xxxs">{text.middleTop}</Typography>
        <Typography style={{ whiteSpace: 'pre' }} className="font-mono text-black text-xxxs">{text.middle}</Typography>
        <Typography style={{ whiteSpace: 'pre' }} className="font-mono text-black text-xxxs">{text.middleBottom}</Typography>
        <Typography style={{ whiteSpace: 'pre' }} className="font-mono text-black text-xxxs">{text.bottom}</Typography>
      </Paper>
    </div>
  );
};

export default ScorePad;
