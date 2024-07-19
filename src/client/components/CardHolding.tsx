import type { GameState } from '@/shared/SocketTypes';

type CardHoldingProps = {
  gameState: GameState;
};

const CardHolding = ({ gameState: { hand, trumpCard: trump } }: CardHoldingProps) => {
  console.log({ hand });
  console.log({ trump });

  return (
    <>
      BOM DIA
    </>
  );
};

export default CardHolding;
