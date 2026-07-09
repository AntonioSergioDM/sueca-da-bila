import {
  useMemo,
  useState,
} from 'react';

import {
  type Score,
  getNextPlayer,
  type GameState,
  type PlayerState,
  getPreviousPlayer,
} from '@/shared/GameTypes';
import { type Card } from '@/shared/Card';
import type { LobbyPlayerState } from '@/shared/SocketTypes';

import { Button } from '@mui/material';
import { useSocket } from '@/client/tools/useSocket';
import { useCardScale } from '@/client/tools/useCardScale';
import getPlayableCards from '@/client/tools/getPlayableCards';
import { BIG_CARD, SMALL_CARD } from '@/client/components/AnimatedCard';

import ScorePad from '../ScorePad';
import TopPlayer from '../Players/TopPlayer';
import LeftPlayer from '../Players/LeftPlayer';
import RightPlayer from '../Players/RightPlayer';
import BottomPlayer from '../Players/BottomPlayer';

import Table from './Table';
import LastTrick from './LastTrick';
import DenounceOverlay from '../DenounceOverlay';

type FramerGameProps = {
  gameState: GameState;
  players: LobbyPlayerState[];
  playerState: PlayerState;
  gameResults: Score[];
  onPlayCard: (card: Card) => void;
  onHideTrump: () => void;
};

const FramerGame = (props: FramerGameProps) => {
  const {
    gameState,
    players,
    onPlayCard,
    onHideTrump,
    playerState,
    gameResults,
  } = props;

  const socket = useSocket();

  const scale = useCardScale();
  const bigCard = useMemo(() => Math.round(BIG_CARD * scale), [scale]);
  const smallCard = useMemo(() => Math.round(SMALL_CARD * scale), [scale]);

  const [denounceOverlayState, setDenounceOverlayState] = useState(false);

  const denounce = (idx: number) => {
    console.info(`denounce ${idx}`);
    socket.emit('denounce', idx);
  };

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

  // Cards the bottom player is allowed to play this turn, so only those glow.
  const playableCards = useMemo(() => (
    gameState.currentPlayer === bottomIdx
      ? getPlayableCards(playerState.hand, gameState.table, gameState.currentPlayer)
      : undefined
  ), [gameState.currentPlayer, gameState.table, bottomIdx, playerState.hand]);

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-red-950 p-2 touch-none select-none">
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
        cardWidth={smallCard}
      />
      <Button className="w-fit z-10" size="small" onClick={() => { setDenounceOverlayState(true); }} color="primary">I spoted a cheater</Button>

      <TopPlayer
        isPlaying={gameState.currentPlayer === topIdx}
        cardNum={gameState.hands[topIdx]}
        trumpCard={(hasTrumpIdx === topIdx && gameState.trumpCard) || null}
        name={players[topIdx].name}
        cardWidth={smallCard}
      />
      <RightPlayer
        isPlaying={gameState.currentPlayer === rightIdx}
        cardNum={gameState.hands[rightIdx]}
        trumpCard={(hasTrumpIdx === rightIdx && gameState.trumpCard) || null}
        name={players[rightIdx].name}
        cardWidth={smallCard}
      />
      <LeftPlayer
        isPlaying={gameState.currentPlayer === leftIdx}
        cardNum={gameState.hands[leftIdx]}
        trumpCard={(hasTrumpIdx === leftIdx && gameState.trumpCard) || null}
        name={players[leftIdx].name}
        cardWidth={smallCard}
      />
      <BottomPlayer
        onPlayCard={onPlayCard}
        onHideTrump={onHideTrump}
        canHideTrump={gameState.tricksCompleted >= 1}
        isPlaying={gameState.currentPlayer === bottomIdx}
        playableCards={playableCards}
        cards={playerState.hand}
        trumpCard={(hasTrumpIdx === bottomIdx && gameState.trumpCard) || null}
        name={players[bottomIdx].name}
        cardWidth={bigCard}
      />

      <LastTrick lastTrick={gameState.lastTrick} players={players} />

      <ScorePad gameResults={gameResults} playerIdx={playerState.index} />
    </div>
  );
};

export default FramerGame;
