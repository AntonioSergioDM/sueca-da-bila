import { useMemo } from 'react';

import { motion } from 'framer-motion';
import { Paper, Typography } from '@mui/material';

import type { Table } from '@/shared/GameTypes';
import type { LobbyPlayerState } from '@/shared/SocketTypes';

import { useCardScale } from '@/client/tools/useCardScale';

import AnimatedCard from '../AnimatedCard';

type LastTrickProps = {
  lastTrick: Table;
  players: LobbyPlayerState[];
};

const LastTrick = ({ lastTrick, players }: LastTrickProps) => {
  const scale = useCardScale();
  const cardWidth = useMemo(() => Math.round(56 * scale), [scale]);

  const trick = useMemo(() => (
    (lastTrick || [])
      .map((card, index) => ({ card, index }))
      .filter((entry): entry is { card: NonNullable<typeof entry.card>; index: number } => !!entry.card)
  ), [lastTrick]);

  if (!trick.length) {
    return null;
  }

  return (
    <div className="fixed top-12 left-2 z-20">
      <Paper elevation={4} className="p-2 flex flex-col gap-1 bg-black/60 rounded-md opacity-80">
        <Typography className="text-white text-xs uppercase tracking-wide">Last round</Typography>
        <div className="flex gap-2">
          {trick.map(({ card, index }) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <motion.div
                whileHover={{ scale: 1.8, zIndex: 30 }}
                transition={{ type: 'spring', damping: 15 }}
                className="origin-top cursor-pointer"
              >
                <AnimatedCard width={cardWidth} card={card} />
              </motion.div>
              <Typography className="text-white text-xxs truncate" style={{ maxWidth: cardWidth }}>
                {players[index]?.name}
              </Typography>
            </div>
          ))}
        </div>
      </Paper>
    </div>
  );
};

export default LastTrick;
