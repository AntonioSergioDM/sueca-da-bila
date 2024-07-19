import { useMemo } from 'react';

import Image from 'next/image';
import { Box, Stack } from '@mui/material';

import type { GameState, PlayerState } from '@/shared/GameTypes';
import type { LobbyPlayerState } from '@/shared/SocketTypes';

import OtherPlayer from './OtherPlayer';
import { CARD_RATIO } from './PlayerCard';
import getCardId from '../tools/getCardId';

type TableProps = {
  players: LobbyPlayerState[];
  playerState: PlayerState;
  gameState: GameState;
};

const getPreviousPlayer = (idx: number) => {
  if (idx === 0) return 3;

  return idx - 1;
};

const getNextPlayer = (idx: number) => {
  if (idx === 3) return 0;

  return idx + 1;
};

const Table = ({ players, playerState, gameState }: TableProps) => {
  const { rightPlayerIdx, topPlayerIdx, leftPlayerIdx } = useMemo(() => ({
    rightPlayerIdx: getNextPlayer(playerState.index),
    topPlayerIdx: getNextPlayer(getNextPlayer(playerState.index)),
    leftPlayerIdx: getNextPlayer(getNextPlayer(getNextPlayer(playerState.index))),
  }), [playerState.index]);

  const hasTrump = useMemo(() => (
    playerState.index === getPreviousPlayer(gameState.shufflePlayer)
  ), [gameState.shufflePlayer, playerState.index]);

  return (
    <Box
      sx={{
        width: 800,
        height: 400,
        backgroundColor: 'blue',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {/* top player */}
      <OtherPlayer
        name={players[topPlayerIdx].name}
        numCards={gameState.hands[topPlayerIdx] || 0}
        itsame={gameState.currentPlayer === topPlayerIdx}
        trumpCard={(topPlayerIdx === getPreviousPlayer(gameState.shufflePlayer) && gameState.trumpCard) || null}
      />

      <Stack direction="row" justifyContent="space-between" width="100%">
        {/* left player */}
        <OtherPlayer
          name={players[leftPlayerIdx].name}
          numCards={gameState.hands[leftPlayerIdx] || 0}
          itsame={gameState.currentPlayer === leftPlayerIdx}
          trumpCard={(leftPlayerIdx === getPreviousPlayer(gameState.shufflePlayer) && gameState.trumpCard) || null}
        />

        <Stack direction="row" gap={4} flexWrap="wrap">
          {gameState.table.filter(Boolean).map((card) => (
            <Image
              key={getCardId(card!)}
              src={`/images/cards/${getCardId(card!)}.png`}
              alt="Card"
              width={40}
              height={50 * CARD_RATIO}
            />
          ))}
        </Stack>

        {/* right player */}
        <OtherPlayer
          name={players[rightPlayerIdx].name}
          numCards={gameState.hands[rightPlayerIdx] || 0}
          itsame={gameState.currentPlayer === rightPlayerIdx}
          trumpCard={(rightPlayerIdx === getPreviousPlayer(gameState.shufflePlayer) && gameState.trumpCard) || null}
        />
      </Stack>

      {(hasTrump && gameState.trumpCard) && (
        <Image
          src={`/images/cards/${getCardId(gameState.trumpCard)}.png`}
          alt="Trump card"
          width={50}
          height={50 * CARD_RATIO}
        />
      )}
    </Box>
  );
};

export default Table;
