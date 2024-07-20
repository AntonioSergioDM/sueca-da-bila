/* eslint-disable @next/next/no-img-element */
import { useMemo } from 'react';
import { Typography } from '@mui/material';

import type { Card } from '@/shared/Card';
import type { LobbyPlayerState } from '@/shared/SocketTypes';
import { getPreviousPlayer, type GameState, type PlayerState } from '@/shared/GameTypes';

import CardImg from '../CardImg';
import FanCards from '../FanCards';

const PLAYER_CARD_WIDTH = 125;
const PLAYER_CARD_HEIGHT = 172.5;

type PlayerHandProps = {
  gameState: GameState;
  playerState: PlayerState;
  players: LobbyPlayerState[];
  onPlayCard: (card: Card) => void;
};

const PlayerHand = (props: PlayerHandProps) => {
  const {
    players,
    gameState,
    onPlayCard,
    playerState,
  } = props;

  const name = useMemo(() => (
    players[playerState.index].name
  ), [playerState.index, players]);

  const isPlaying = useMemo(() => (
    gameState.currentPlayer === playerState.index
  ), [gameState.currentPlayer, playerState.index]);

  const trumpCard = useMemo(() => (
    (getPreviousPlayer(gameState.shufflePlayer) === playerState.index && gameState.trumpCard)
    || null
  ), [gameState.shufflePlayer, gameState.trumpCard, playerState.index]);

  return (
    <div>
      {/* hand with fan effect */}
      <div className="flex relative justify-center items-start flex-row">
        <FanCards
          cards={playerState.hand}
          pulse={isPlaying}
          width={PLAYER_CARD_WIDTH}
          height={PLAYER_CARD_HEIGHT}
          onPlayCard={isPlaying ? onPlayCard : undefined}
          hoverable={isPlaying}
        />
      </div>

      <Typography>{name}</Typography>

      {!!trumpCard && (
        <CardImg
          card={trumpCard}
          width={PLAYER_CARD_WIDTH}
          height={PLAYER_CARD_HEIGHT}
        />
      )}
    </div>
  );
};

export default PlayerHand;
