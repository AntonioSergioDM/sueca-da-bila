import { motion, type Variant } from 'framer-motion';

import type { Card } from '@/shared/Card';

import AnimatedCard, { SMALL_CARD } from '../AnimatedCard';

const toGraveyard = {
  x: 'calc(100vw + 50%)',
  y: 'calc(100vh + 50%)',
  rotate: 360,
  transition: {
    duration: 0.8,
  },
};

export type TableCardVariants = {
  fromHand: Variant;
  inTable: Variant;
};

type TableCardProps = {
  variants: TableCardVariants;
  card: Card;
};

const TableCard = ({ card, variants }: TableCardProps) => (
  <motion.div
    variants={variants}
    initial="fromHand"
    animate="inTable"
    exit={toGraveyard}
    className="absolute bottom-0 select-none"
  >
    <AnimatedCard width={SMALL_CARD} card={card} />
  </motion.div>
);

export default TableCard;
