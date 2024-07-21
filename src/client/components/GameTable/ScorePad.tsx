import { useMemo } from 'react';
import { bestOfThree } from '@/client/tools/printScore';
import type { Score } from '@/shared/GameTypes';
import { Paper, Typography } from '@mui/material';

type TableProps = {
  gameResults: Score[];
};

const ScorePad = ({ gameResults }: TableProps) => {
  const text = useMemo(() => bestOfThree(gameResults), [gameResults]);

  return (
    <div className="flex items-center w-full">
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
