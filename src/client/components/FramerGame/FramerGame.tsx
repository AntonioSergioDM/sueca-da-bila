/* eslint-disable object-curly-newline */
import { useCallback, useMemo } from 'react';

import { useSnackbar } from 'notistack';

import {
  getNextPlayer,
  getPreviousPlayer,
} from '@/shared/GameTypes';
import type { Card } from '@/shared/Card';

import { useSocket } from '@/client/tools/useSocket';
import { setPlayerState } from '@/client/redux/gameSlice';
import { useAppDispatch, useGameState, useGamePlayer } from '@/client/redux/store';

import ScorePad from '../ScorePad';
import TopPlayer from '../Players/TopPlayer';
import LeftPlayer from '../Players/LeftPlayer';
import RightPlayer from '../Players/RightPlayer';
import BottomPlayer from '../Players/BottomPlayer';

import Table from './Table';

const FramerGame = () => {
  const socket = useSocket();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const {
    hands,
    trumpCard,
    currentPlayer,
    shufflePlayer,
  } = useGameState();
  console.log('🚀 ~ FramerGame ~ hands:', hands);

  const { index } = useGamePlayer()!; // if we are in FramerGame, there should be a player state

  const onPlayCard = useCallback((card: Card) => {
    socket.emit('playCard', card, (res) => {
      if (typeof res.error === 'string') {
        enqueueSnackbar({
          variant: 'error',
          message: res.error,
        });
      } else {
        dispatch(setPlayerState(res.data));
      }
    });
  }, [dispatch, enqueueSnackbar, socket]);

  const { topIdx, rightIdx, bottomIdx, leftIdx } = useMemo(() => ({
    topIdx: getNextPlayer(getNextPlayer(index)),
    rightIdx: getNextPlayer(index),
    bottomIdx: index,
    leftIdx: getPreviousPlayer(index),
  }), [index]);

  const hasTrumpIdx = useMemo(() => (
    getPreviousPlayer(shufflePlayer)
  ), [shufflePlayer]);

  return (
    <div className="relative w-screen h-screen bg-red-950 p-2">
      <Table
        topIdx={topIdx}
        leftIdx={leftIdx}
        rightIdx={rightIdx}
        bottomIdx={bottomIdx}
      />

      <TopPlayer
        isPlaying={currentPlayer === topIdx}
        cardNum={hands[topIdx]}
        trumpCard={(hasTrumpIdx === topIdx && trumpCard) || null}
      />
      <RightPlayer
        isPlaying={currentPlayer === rightIdx}
        cardNum={hands[rightIdx]}
        trumpCard={(hasTrumpIdx === rightIdx && trumpCard) || null}
      />
      <LeftPlayer
        isPlaying={currentPlayer === leftIdx}
        cardNum={hands[leftIdx]}
        trumpCard={(hasTrumpIdx === leftIdx && trumpCard) || null}
      />

      <BottomPlayer
        onPlayCard={onPlayCard}
        isPlaying={currentPlayer === bottomIdx}
        trumpCard={(hasTrumpIdx === bottomIdx && trumpCard) || null}
      />

      <ScorePad />
    </div>
  );
};

export default FramerGame;
