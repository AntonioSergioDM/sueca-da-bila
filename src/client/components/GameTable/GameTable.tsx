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
import type { Card } from '@/shared/Card';
import type { LobbyPlayerState, ServerToClientEvents } from '@/shared/SocketTypes';

import { useSocket } from '@/client/tools/useSocket';

import Table from './Table';
import Opponent from './Opponent';
import ScorePad from './ScorePad';
import PlayerHand from './PlayerHand';

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

  const socket = useSocket();
  const { enqueueSnackbar } = useSnackbar();

  const [gameResults, setGameResults] = useState<Score[] | []>([]);

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
  }, [enqueueSnackbar, playerState]);

  useEffect(() => {
    socket.on('gameResults', onGameResults);

    return () => {
      socket.off('gameResults', onGameResults);
    };
  }, [onGameResults, socket]);

  const topPlayer = useMemo(() => {
    // top player is 2 seats to the right (or two seats to the left)
    const topIdx = getNextPlayer(getNextPlayer(playerState.index));

    if (!players[topIdx]) return null;

    const hasTrump = getPreviousPlayer(gameState.shufflePlayer) === topIdx;

    return {
      idx: topIdx,
      name: players[topIdx].name,
      numCards: gameState.hands[topIdx],
      isPlaying: gameState.currentPlayer === topIdx,
      trumpCard: (hasTrump && gameState.trumpCard) || null,
    };
  }, [gameState.currentPlayer, gameState.hands, gameState.shufflePlayer, gameState.trumpCard, playerState.index, players]);

  const leftPlayer = useMemo(() => {
    // left player is 1 seat to the left
    const leftIdx = getPreviousPlayer(playerState.index);

    if (!players[leftIdx]) return null;

    const hasTrump = getPreviousPlayer(gameState.shufflePlayer) === leftIdx;

    return {
      idx: leftIdx,
      name: players[leftIdx].name,
      numCards: gameState.hands[leftIdx],
      isPlaying: gameState.currentPlayer === leftIdx,
      trumpCard: (hasTrump && gameState.trumpCard) || null,
    };
  }, [gameState.currentPlayer, gameState.hands, gameState.shufflePlayer, gameState.trumpCard, playerState.index, players]);

  const rightPlayer = useMemo(() => {
    // right player is 1 seat to the right
    const rightIdx = getNextPlayer(playerState.index);

    if (!players[rightIdx]) return null;

    const hasTrump = getPreviousPlayer(gameState.shufflePlayer) === rightIdx;

    return {
      idx: rightIdx,
      name: players[rightIdx].name,
      numCards: gameState.hands[rightIdx],
      isPlaying: gameState.currentPlayer === rightIdx,
      trumpCard: (hasTrump && gameState.trumpCard) || null,
    };
  }, [gameState.currentPlayer, gameState.hands, gameState.shufflePlayer, gameState.trumpCard, playerState.index, players]);

  return (
    <div className="p-4 w-[100vw] h-[100vh] flex justify-center items-center">
      <div className="w-[90%] h-[90%] p-1 bg-slate-500 rounded-[100px] border-cyan-400 grid grid-cols-[25%_auto_25%] grid-rows-[25%_auto_25%] gap-1">
        {/* EMPTY */}
        <div />

        {/* TOP PLAYER */}
        {topPlayer ? <Opponent {...topPlayer} position="top" /> : <div />}

        {/* EMPTY */}
        <div />

        {/* LEFT PLAYER */}
        {leftPlayer ? <Opponent {...leftPlayer} position="left" /> : <div />}

        {/* TABLE */}
        <Table
          gameState={gameState}
          topIdx={topPlayer?.idx}
          leftIdx={leftPlayer?.idx}
          rightIdx={rightPlayer?.idx}
          bottomIdx={playerState.index}
        />

        {/* RIGHT PLAYER */}
        {rightPlayer ? <Opponent {...rightPlayer} position="right" /> : <div />}

        {/* RESULTS */}
        <ScorePad gameResults={gameResults} playerIdx={playerState.index} />

        {/* ME */}
        <PlayerHand
          players={players}
          gameState={gameState}
          onPlayCard={onPlayCard}
          playerState={playerState}
        />

        {/* EMPTY */}
        <div />
      </div>
    </div>
  );
};

export default GameTable;
