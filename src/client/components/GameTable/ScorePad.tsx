import { useMemo } from 'react';
import { bestOfThree } from '@/client/tools/printScore';
import type { Score } from '@/shared/GameTypes';
import { Paper, Typography } from '@mui/material';

type TableProps = {
  gameResults: Score[];
};

const ScorePad = ({ gameResults }: TableProps) => {
  const text = useMemo(() => bestOfThree(gameResults), [gameResults]);

  console.log(`${text.top}\n${text.middleTop}\n${text.middle}\n${text.middleBottom}\n${text.bottom}`);

  return (
    <Paper elevation={3} className="p-0 flex gap-0 flex-col font-mono bg-white">
      <Typography className="font-mono text-black text-xs">{text.top}</Typography>
      <Typography className="font-mono text-black text-xs">{text.middleTop}</Typography>
      <Typography className="font-mono text-black text-xs">{text.middle}</Typography>
      <Typography className="font-mono text-black text-xs">{text.middleBottom}</Typography>
      <Typography className="font-mono text-black text-xs">{text.bottom}</Typography>
    </Paper>
  );
};

export default ScorePad;
