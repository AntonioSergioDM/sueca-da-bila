import { Box, CircularProgress } from '@mui/material';

type OtherPlayerProps = {
  name: string;
  numCards: number;
  itsame: boolean;
};

const OtherPlayer = ({ name, numCards, itsame }: OtherPlayerProps) => {
  console.log();
  return (
    <Box sx={{ width: 200, height: 100, backgroundColor: 'orange' }}>
      {`${name} with ${numCards} cards`}
      {itsame && <CircularProgress />}
    </Box>
  );
};

export default OtherPlayer;
