import { useMemo } from 'react';

import type { GameState } from '@/shared/GameTypes';

import CardImg from '../CardImg';

const TABLE_CARD_WIDTH = 100;
const TABLE_CARD_HEIGHT = 138;

type TableProps = {
  topIdx?: number;
  leftIdx?: number;
  rightIdx?: number;
  bottomIdx: number;
  gameState: GameState;
};

const Table = (props: TableProps) => {
  const {
    topIdx,
    leftIdx,
    rightIdx,
    gameState,
    bottomIdx,
  } = props;

  const topCard = useMemo(() => (
    typeof topIdx === 'number' ? gameState.table[topIdx] : null
  ), [gameState.table, topIdx]);

  const leftCard = useMemo(() => (
    typeof leftIdx === 'number' ? gameState.table[leftIdx] : null
  ), [gameState.table, leftIdx]);

  const rightCard = useMemo(() => (
    typeof rightIdx === 'number' ? gameState.table[rightIdx] : null
  ), [gameState.table, rightIdx]);

  const bottomCard = useMemo(() => (
    gameState.table[bottomIdx]
  ), [gameState.table, bottomIdx]);

  return (
    <div className="grid grid-cols-[25%_auto_25%] grid-rows-[25%_auto_25%] gap-1">
      {/* EMPTY */}
      <div />

      {/* TOP PLAYER */}
      {topCard
        ? (
          <div className="flex-grow flex items-center justify-center">
            <CardImg card={topCard} width={TABLE_CARD_WIDTH} height={TABLE_CARD_HEIGHT} />
          </div>
        )
        : <div />}

      {/* EMPTY */}
      <div />

      {/* LEFT PLAYER */}
      {leftCard
        ? (
          <div className="flex-grow flex items-center justify-center">
            <CardImg card={leftCard} width={TABLE_CARD_WIDTH} height={TABLE_CARD_HEIGHT} />
          </div>
        )
        : <div />}

      {/* TABLE */}
      <div />

      {/* RIGHT PLAYER */}
      {rightCard
        ? (
          <div className="flex-grow flex items-center justify-center">
            <CardImg card={rightCard} width={TABLE_CARD_WIDTH} height={TABLE_CARD_HEIGHT} />
          </div>
        )
        : <div />}

      {/* EMPTY */}
      <div />

      {/* ME */}
      {bottomCard
        ? (
          <div className="flex-grow flex items-center justify-center">
            <CardImg card={bottomCard} width={TABLE_CARD_WIDTH} height={TABLE_CARD_HEIGHT} />
          </div>
        )
        : <div />}

      {/* EMPTY */}
      <div />
    </div>
  );
};

export default Table;
