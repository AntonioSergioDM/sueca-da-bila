import { useCallback, useMemo } from 'react';

import Image from 'next/image';

import { ButtonBase } from '@mui/material';

import { type Card } from '@/shared/Card';

import getCardId from '../tools/getCardId';

export const CARD_WIDTH = 180;
export const CARD_HEIGHT = 250;
export const CARD_RATIO = CARD_HEIGHT / CARD_WIDTH;

type PlayerCardProps = {
  card: Card;
  onPlay: (card: Card) => void;
};

const PlayerCard = ({ card, onPlay }: PlayerCardProps) => {
  const onCardClick = useCallback(() => {
    onPlay(card);
  }, [card, onPlay]);

  const cardId = useMemo(() => (
    getCardId(card)
  ), [card]);

  const cardImageSrc = useMemo(() => (
    `/images/cards/${cardId}.png`
  ), [cardId]);

  return (
    <ButtonBase onClick={onCardClick}>
      <Image src={cardImageSrc} alt={`Card ${cardId}`} width={75} height={75 * CARD_RATIO} />
    </ButtonBase>
  );
};

export default PlayerCard;
