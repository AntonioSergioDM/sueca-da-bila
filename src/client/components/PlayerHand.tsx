import { useCallback } from 'react';

import { Stack } from '@mui/material';

import type { Card } from '@/shared/Card';
import type { PlayerState } from '@/shared/GameTypes';

import PlayerCard from './PlayerCard';
import { useSocket } from '../tools/useSocket';

type PlayerHandProps = {
  playerState: PlayerState;
};

const PlayerHand = ({ playerState }: PlayerHandProps) => {
  const socket = useSocket();

  const onPlayCard = useCallback((card: Card) => {
    socket.emit('playCard', card, (success) => {
      console.log('played card');
      console.log({ success });
    });
  }, [socket]);

  return (
    <Stack direction="row" justifyContent="center" gap={2} flexWrap="wrap" maxWidth="sm">
      {playerState.hand.map((card) => (
        <PlayerCard
          key={`${card.suit}${card.value}`}
          card={card}
          onPlay={onPlayCard}
        />
      ))}
    </Stack>
  );
};

export default PlayerHand;
