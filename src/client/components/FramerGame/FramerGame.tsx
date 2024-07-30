/* eslint-disable object-curly-newline */
import { useCallback, useMemo, useState } from 'react';

import { useSnackbar } from 'notistack';

import { Button } from '@mui/material';

import {
  PlayErrors,
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
import DenounceOverlay from '../DenounceOverlay';
import RenounceOverlay from '../RenounceOverlay';
import BottomPlayer from '../Players/BottomPlayer';

import Table from './Table';

const FramerGame = () => {
  const socket = useSocket();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const {
    hands,
    players,
    trumpCard,
    currentPlayer,
    shufflePlayer,
  } = useGameState();

  const [denounceOverlayState, setDenounceOverlayState] = useState(false);
  const [renounceOverlayState, setRenounceOverlayState] = useState<Card | null>(null);

  const { index } = useGamePlayer()!; // if we are in FramerGame, there should be a player state

  const denounce = (idx: number) => {
    socket.emit('denounce', idx);
  };

  const onPlayCard = useCallback((card: Card, allowRenounce = false) => {
    socket.emit('playCard', card, allowRenounce, (res) => {
      if (typeof res.error === 'string') {
        enqueueSnackbar({
          variant: 'error',
          message: res.error,
        });

        if (res.error === PlayErrors.mustAssist) {
          setRenounceOverlayState(card);
        }
      } else {
        dispatch(setPlayerState(res.data));
      }
    });
  }, [dispatch, enqueueSnackbar, socket]);

  const onOpenDenounceOverlay = useCallback(() => {
    setDenounceOverlayState(true);
  }, []);

  const onCloseDenounceOverlay = useCallback(() => {
    setDenounceOverlayState(false);
  }, []);

  const onCloseRenounceOverlay = useCallback(() => {
    setRenounceOverlayState(null);
  }, []);

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

      <Button className="w-fit" onClick={onOpenDenounceOverlay} color="primary">I spoted a cheater</Button>

      <TopPlayer
        name={players[topIdx]?.name}
        isPlaying={currentPlayer === topIdx}
        cardNum={hands[topIdx] || 0}
        trumpCard={(hasTrumpIdx === topIdx && trumpCard) || null}
      />
      <RightPlayer
        name={players[rightIdx]?.name}
        isPlaying={currentPlayer === rightIdx}
        cardNum={hands[rightIdx] || 0}
        trumpCard={(hasTrumpIdx === rightIdx && trumpCard) || null}
      />
      <LeftPlayer
        name={players[leftIdx]?.name}
        isPlaying={currentPlayer === leftIdx}
        cardNum={hands[leftIdx] || 0}
        trumpCard={(hasTrumpIdx === leftIdx && trumpCard) || null}
      />

      <BottomPlayer
        name={players[bottomIdx]?.name}
        isPlaying={currentPlayer === bottomIdx}
        trumpCard={(hasTrumpIdx === bottomIdx && trumpCard) || null}
        onPlayCard={onPlayCard}
      />

      <ScorePad />

      <RenounceOverlay
        card={renounceOverlayState}
        onClose={onCloseRenounceOverlay}
        onPlayCard={onPlayCard}
      />

      <DenounceOverlay
        open={denounceOverlayState}
        onClose={onCloseDenounceOverlay}
        denounce={denounce}
        playerLeft={{ name: players[leftIdx]?.name, index: leftIdx }}
        playerRight={{ name: players[rightIdx]?.name, index: rightIdx }}
      />
    </div>
  );
};

export default FramerGame;
