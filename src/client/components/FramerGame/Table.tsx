import { useMemo } from 'react';

import { AnimatePresence } from 'framer-motion';

import { useGameTable } from '@/client/redux/store';
import getRandomRange from '@/client/tools/getRandomRange';

import TableCard, { type TableCardVariants } from './TableCard';

type TableProps = {
  topIdx: number;
  rightIdx: number;
  bottomIdx: number;
  leftIdx: number;
};

const Table = (props: TableProps) => {
  const {
    topIdx,
    rightIdx,
    bottomIdx,
    leftIdx,
  } = props;

  const table = useGameTable();

  const topCard = useMemo(() => (table[topIdx] || null), [table, topIdx]);

  const rightCard = useMemo(() => (table[rightIdx] || null), [table, rightIdx]);

  const bottomCard = useMemo(() => (table[bottomIdx] || null), [table, bottomIdx]);

  const leftCard = useMemo(() => (table[leftIdx] || null), [table, leftIdx]);

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
  }, []);

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
  }, []);

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
  }, []);

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
  }, []);

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
