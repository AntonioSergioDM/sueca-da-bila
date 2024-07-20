/* eslint-disable @next/next/no-img-element */
import { useCallback, useMemo } from 'react';
import { Box, Typography } from '@mui/material';

import type { Card } from '@/shared/Card';
import getCardId from '@/client/tools/getCardId';
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

  const handWithoutTrump = useMemo(() => {
    if (!trumpCard) return playerState.hand;

    return playerState.hand.filter((card) => getCardId(card) !== getCardId(trumpCard));
  }, [playerState.hand, trumpCard]);

  const onPlayTrump = useCallback(() => {
    if (trumpCard) {
      onPlayCard(trumpCard);
    }
  }, [onPlayCard, trumpCard]);

  return (
    <div>
      {!!trumpCard && (
        <Box
          draggable={false}
          onClick={onPlayTrump}
          sx={{
            width: PLAYER_CARD_WIDTH,
            height: PLAYER_CARD_HEIGHT,
            overflow: 'hidden',
            position: 'absolute',
            userSelect: 'none',
            borderWidth: 2,
            borderRadius: '4px',
            borderColor: 'black',
            borderStyle: 'solid',
            animation: isPlaying ? 'pulse 1s infinite alternate' : 'none',

            ...(isPlaying ? {
              ':hover': {
                cursor: 'pointer',
                scale: '110%',
              },
            } : {}),

            '@keyframes pulse': {
              from: { borderColor: 'black' },
              to: { borderColor: 'gold' },
            },
          }}
        >
          <CardImg
            card={trumpCard}
            width={PLAYER_CARD_WIDTH}
            height={PLAYER_CARD_HEIGHT}
          />
        </Box>
      )}
      {/* hand with fan effect */}
      <div className="flex relative justify-center items-start flex-row">
        <FanCards
          cards={handWithoutTrump}
          pulse={isPlaying}
          width={PLAYER_CARD_WIDTH}
          height={PLAYER_CARD_HEIGHT}
          onPlayCard={isPlaying ? onPlayCard : undefined}
          hoverable={isPlaying}
        />
      </div>

      <Typography>{name}</Typography>
    </div>
  );
};

export default PlayerHand;
