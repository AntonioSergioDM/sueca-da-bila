import {
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';

import { useSnackbar } from 'notistack';

import {
  type Score,
  getNextPlayer,
  type GameState,
  type PlayerState,
  getPreviousPlayer,
} from '@/shared/GameTypes';
import { type Card } from '@/shared/Card';
import type { LobbyPlayerState, ServerToClientEvents } from '@/shared/SocketTypes';

import { Button } from '@mui/material';
import { useSocket } from '@/client/tools/useSocket';

import ScorePad from '../ScorePad';
import TopPlayer from '../Players/TopPlayer';
import LeftPlayer from '../Players/LeftPlayer';
import RightPlayer from '../Players/RightPlayer';
import BottomPlayer from '../Players/BottomPlayer';

import Table from './Table';
import DenounceOverlay from '../DenounceOverlay';

type FramerGameProps = {
  gameState: GameState;
  players: LobbyPlayerState[];
  playerState: PlayerState;
  onPlayCard: (card: Card) => void;
};

const FramerGame = (props: FramerGameProps) => {
  const {
    gameState,
    players,
    onPlayCard,
    playerState,
  } = props;

  const socket = useSocket();
  const { enqueueSnackbar } = useSnackbar();

  const [gameResults, setGameResults] = useState<Score[] | []>([]);
  const [denounceOverlayState, setDenounceOverlayState] = useState(false);

  const denounce = (idx) => {
    console.log('denounce' + idx);
    socket.emit('denounce', idx);
  };

  const onGameResults = useCallback<ServerToClientEvents['gameResults']>((results) => {
    if (!results.length) {
      return;
    }
    setGameResults(results);
    const myTeam = playerState.index % 2;
    const result = results[results.length - 1] || [0, 0];
    enqueueSnackbar({
      variant: 'info',
      message: `Game ended: You ${result[myTeam] > result[myTeam ? 0 : 1] ? 'won' : 'lost'}! Points: ${result[myTeam]}`,
    });
  }, [enqueueSnackbar, playerState.index]);

  useEffect(() => {
    socket.on('gameResults', onGameResults);

    return () => {
      socket.off('gameResults', onGameResults);
    };
  }, [onGameResults, socket]);

  const {
    topIdx,
    rightIdx,
    bottomIdx,
    leftIdx,
  } = useMemo(() => ({
    topIdx: getNextPlayer(getNextPlayer(playerState.index)),
    rightIdx: getNextPlayer(playerState.index),
    bottomIdx: playerState.index,
    leftIdx: getPreviousPlayer(playerState.index),
  }), [playerState.index]);

  const hasTrumpIdx = useMemo(() => (
    getPreviousPlayer(gameState.shufflePlayer)
  ), [gameState.shufflePlayer]);

  return (
    <div className="relative w-screen h-screen bg-red-950 p-2">
      <DenounceOverlay
        open={denounceOverlayState}
        onClose={() => setDenounceOverlayState(false)}
        denounce={denounce}
        playerLeft={{ name: players[leftIdx].name, index: leftIdx }}
        playerRight={{ name: players[rightIdx].name, index: rightIdx }}
      />
      <Table
        topIdx={topIdx}
        leftIdx={leftIdx}
        rightIdx={rightIdx}
        gameState={gameState}
        bottomIdx={bottomIdx}
      />
      <Button className="w-fit" onClick={() => { setDenounceOverlayState(true) }} color="primary">I spoted a cheater</Button>

      <TopPlayer
        isPlaying={gameState.currentPlayer === topIdx}
        cardNum={gameState.hands[topIdx]}
        trumpCard={(hasTrumpIdx === topIdx && gameState.trumpCard) || null}
        name={players[topIdx].name}
      />
      <RightPlayer
        isPlaying={gameState.currentPlayer === rightIdx}
        cardNum={gameState.hands[rightIdx]}
        trumpCard={(hasTrumpIdx === rightIdx && gameState.trumpCard) || null}
        name={players[rightIdx].name}
      />
      <LeftPlayer
        isPlaying={gameState.currentPlayer === leftIdx}
        cardNum={gameState.hands[leftIdx]}
        trumpCard={(hasTrumpIdx === leftIdx && gameState.trumpCard) || null}
        name={players[leftIdx].name}
      />
      <BottomPlayer
        onPlayCard={onPlayCard}
        isPlaying={gameState.currentPlayer === bottomIdx}
        cards={playerState.hand}
        trumpCard={(hasTrumpIdx === bottomIdx && gameState.trumpCard) || null}
        name={players[bottomIdx].name}
      />

      <ScorePad gameResults={gameResults} playerIdx={playerState.index} />
    </div>
  );
};

export default FramerGame;
