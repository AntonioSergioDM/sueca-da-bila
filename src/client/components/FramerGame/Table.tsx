import { useMemo } from 'react';

import { AnimatePresence } from 'framer-motion';

import type { GameState } from '@/shared/GameTypes';
import getRandomRange from '@/client/tools/getRandomRange';

import TableCard, { type TableCardVariants } from './TableCard';

type TableProps = {
  topIdx: number;
  rightIdx: number;
  bottomIdx: number;
  leftIdx: number;
  gameState: GameState;
};

const Table = (props: TableProps) => {
  const {
    topIdx,
    rightIdx,
    bottomIdx,
    leftIdx,
    gameState,
  } = props;

  const {
    topCard,
    rightCard,
    bottomCard,
    leftCard,
  } = useMemo(() => ({
    topCard: gameState.table[topIdx] || null,
    rightCard: gameState.table[rightIdx] || null,
    bottomCard: gameState.table[bottomIdx] || null,
    leftCard: gameState.table[leftIdx] || null,
  }), [bottomIdx, gameState.table, leftIdx, rightIdx, topIdx]);

  const topVariant = useMemo((): TableCardVariants => {
    const randY = getRandomRange(25, 75);
    const randX = getRandomRange(25, 75);
    const randRotation = getRandomRange(-45, 45);

    return {
      fromHand: {
        x: '-50%',
        y: '-50vh',
      },
      inTable: {
        x: `-${randX}%`,
        y: `-${randY}%`,
        rotate: 180 + randRotation,
        transition: {
          type: 'tween',
        },
      },
    };

    // depends on its card to randomize position
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topCard]);

  const rightVariant = useMemo((): TableCardVariants => {
    const randY = getRandomRange(25, 75);
    const randX = getRandomRange(25, 75);
    const randRotation = getRandomRange(-45, 45);

    return {
      fromHand: {
        x: '50vw',
        y: '-50%',
      },
      inTable: {
        x: `${randX}%`,
        y: `${randY}%`,
        rotate: -90 + randRotation,
        transition: {
          type: 'tween',
        },
      },
    };

    // depends on its card to randomize position
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rightCard]);

  const bottomVariant = useMemo((): TableCardVariants => {
    const randY = getRandomRange(25, 75);
    const randX = getRandomRange(25, 75);
    const randRotation = getRandomRange(-45, 45);

    return {
      fromHand: {
        x: '-50%',
        y: '50vh',
      },
      inTable: {
        x: `-${randX}%`,
        y: `${randY + 100}%`,
        rotate: randRotation,
        transition: {
          type: 'tween',
        },
      },
    };

    // depends on its card to randomize position
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bottomCard]);

  const leftVariant = useMemo((): TableCardVariants => {
    const randY = getRandomRange(25, 75);
    const randX = getRandomRange(25, 75);
    const randRotation = getRandomRange(-45, 45);

    return {
      fromHand: {
        x: '-50vw',
        y: '-50%',
      },
      inTable: {
        x: `-${randX + 100}%`,
        y: `${randY}%`,
        rotate: 90 + randRotation,
        transition: {
          type: 'tween',
        },
      },
    };

    // depends on its card to randomize position
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftCard]);

  return (
    <div
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-500"
    >
      <AnimatePresence>
        {!!topCard && (
          <TableCard
            key="top"
            card={topCard}
            variants={topVariant}
          />
        )}

        {!!rightCard && (
          <TableCard
            key="right"
            card={rightCard}
            variants={rightVariant}
          />
        )}

        {!!bottomCard && (
          <TableCard
            key="bottom"
            card={bottomCard}
            variants={bottomVariant}
          />
        )}

        {!!leftCard && (
          <TableCard
            key="left"
            card={leftCard}
            variants={leftVariant}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Table;
