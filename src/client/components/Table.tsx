import { useMemo } from 'react';

import { Box, Stack } from '@mui/material';

import type { GameState, PlayerState } from '@/shared/GameTypes';

import OtherPlayer from './OtherPlayer';

type TableProps = {
  players: string[];
  playerState: PlayerState;
  gameState: GameState;
};

const getNextPlayer = (idx: number) => {
  if (idx === 3) return 0;

  return idx + 1;
};

const Table = ({ players, playerState, gameState }: TableProps) => {
  console.log('🚀 ~ Table ~ gameState:', gameState);

  const { rightPlayerIdx, topPlayerIdx, leftPlayerIdx } = useMemo(() => ({
    rightPlayerIdx: getNextPlayer(playerState.index),
    topPlayerIdx: getNextPlayer(getNextPlayer(playerState.index)),
    leftPlayerIdx: getNextPlayer(getNextPlayer(getNextPlayer(playerState.index))),
  }), [playerState.index]);

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
        name={players[topPlayerIdx]}
        numCards={gameState.hands[topPlayerIdx] || 0}
        itsame={gameState.currentPlayer === topPlayerIdx}
      />

      <Stack direction="row" justifyContent="space-between" width="100%">
        {/* left player */}
        <OtherPlayer
          name={players[leftPlayerIdx]}
          numCards={gameState.hands[leftPlayerIdx] || 0}
          itsame={gameState.currentPlayer === leftPlayerIdx}
        />

        {/* right player */}
        <OtherPlayer
          name={players[rightPlayerIdx]}
          numCards={gameState.hands[rightPlayerIdx] || 0}
          itsame={gameState.currentPlayer === rightPlayerIdx}
        />
      </Stack>

    </Box>
  );
};

export default Table;
