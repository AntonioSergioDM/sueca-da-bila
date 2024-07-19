import { CircularProgress, Stack } from '@mui/material';

import type { GameState, PlayerState } from '@/shared/GameTypes';

import type { Card } from '@/shared/Card';
import PlayerCard from './PlayerCard';

type PlayerHandProps = {
  gameState: GameState;
  playerState: PlayerState;
  onPlayCard: (card: Card) => void;
};

const PlayerHand = ({ playerState, onPlayCard, gameState }: PlayerHandProps) => (

  <Stack direction="row" alignItems="center" justifyContent="center" gap={2} flexWrap="wrap" maxWidth="sm">
    {playerState.hand.map((card) => (
      <PlayerCard
        key={`${card.suit}${card.value}`}
        card={card}
        onPlay={onPlayCard}
      />
    ))}

    {gameState.currentPlayer === playerState.index && (
      <CircularProgress />
    )}
  </Stack>
);

export default PlayerHand;
