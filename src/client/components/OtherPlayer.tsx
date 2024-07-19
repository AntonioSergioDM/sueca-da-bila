import Image from 'next/image';

import { Box, CircularProgress } from '@mui/material';

import type { Card } from '@/shared/Card';

import { CARD_RATIO } from './PlayerCard';
import getCardId from '../tools/getCardId';

type OtherPlayerProps = {
  name: string;
  numCards: number;
  itsame: boolean;
  trumpCard: Card | null;
};

const OtherPlayer = (props: OtherPlayerProps) => {
  const {
    name,
    itsame,
    numCards,
    trumpCard,
  } = props;

  return (
    <Box sx={{ width: 200, height: 100, backgroundColor: 'orange' }}>
      {`${name} with ${numCards} cards`}
      {itsame && <CircularProgress />}

      {!!trumpCard && (
        <Image
          src={`/images/cards/${getCardId(trumpCard)}.png`}
          alt="Trump card"
          width={35}
          height={35 * CARD_RATIO}
        />
      )}
    </Box>
  );
};

export default OtherPlayer;
