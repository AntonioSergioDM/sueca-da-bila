/* eslint-disable @next/next/no-img-element */
import { useMemo } from 'react';

import type { Card } from '@/shared/Card';

import getCardId from '../tools/getCardId';

type CardImgProps = {
  card?: Card | null;
  /** Card width */
  width: number;
  /** Card height */
  height: number;
};

const CardImg = ({ card, width, height }: CardImgProps) => {
  const cardId = useMemo(() => (
    card ? getCardId(card) : null
  ), [card]);

  return (
    <img
      alt={cardId ? `Card: ${cardId}` : 'Card cover'}
      src={cardId ? `/images/cards/${cardId}.png` : '/images/cards/Cover.png'}
      width={width}
      height={height}
      draggable={false}
    />
  );
};

export default CardImg;
