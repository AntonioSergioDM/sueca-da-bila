import type { Hand } from '@/shared/GameTypes';

type CardHoldingProps = {
  hand: Hand;
};

const CardHolding = ({ hand }: CardHoldingProps) => {
  console.log({ hand });

  return (
    <>
      BOM DIA
    </>
  );
};

export default CardHolding;
