import type { Card } from '@/shared/Card';
import type { LobbyPlayerState } from '@/shared/SocketTypes';
import type { GameState, PlayerState } from '@/shared/GameTypes';

import OldTable from './OldTable';
import OldPlayerHand from './OldPlayerHand';

type GameTableProps = {
  gameState: GameState;
  playerState: PlayerState;
  players: LobbyPlayerState[];
  onPlayCard: (card: Card) => void;
};

const GameTable = (props: GameTableProps) => {
  const {
    players,
    gameState,
    onPlayCard,
    playerState,
  } = props;

  return (
    <>
      <OldTable gameState={gameState} playerState={playerState} players={players} />

      <OldPlayerHand gameState={gameState} playerState={playerState} onPlayCard={onPlayCard} />
    </>
  );
};

export default GameTable;
