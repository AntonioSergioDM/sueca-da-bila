/* eslint-disable @next/next/no-img-element */
import clsx from 'clsx';
import { useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';

import type { Card } from '@/shared/Card';
import getCardId from '@/client/tools/getCardId';

import styles from './AnimatedCard.module.css';

export const SMALL_CARD = 80;
export const BIG_CARD = 100;

type AnimatedCardProps = {
  width: number;
  card?: Card | null;
  clickable?: boolean;
  pulse?: boolean;
  rgb?: boolean;
};

const AnimatedCard = (props: AnimatedCardProps) => {
  const {
    rgb,
    card,
    pulse,
    width,
    clickable,
  } = props;

  const cardId = useMemo(() => (card ? getCardId(card) : 'Cover'), [card]);

  const variants = useMemo<Variants>(() => ({
    tap: {
      scale: 1.1,
    },
    hover: {
      y: -35,
      scale: 1.2,
      cursor: 'pointer',
    },
  }), []);

  return (
    <motion.div
      variants={variants}
      whileTap={clickable ? 'tap' : undefined}
      whileHover={clickable ? 'hover' : undefined}
    >
      <img
        width={width}
        draggable={false}
        alt={`Card: ${cardId}`}
        src={`/images/cards/${cardId}.png`}
        className={
          clsx(
            'rounded-md outline outline-1 outline-black shadow-md bg-black',
            pulse && !rgb && styles.pulse,
            pulse && rgb && styles.pulseRgb,
          )
        }
      />
    </motion.div>
  );
};

export default AnimatedCard;
