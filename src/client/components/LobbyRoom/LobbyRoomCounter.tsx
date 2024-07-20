import { useMemo } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

type LobbyRoomCounterProps = {
  value: number;
  outOf: number;
};

const LobbyRoomCounter = ({ value, outOf }: LobbyRoomCounterProps) => {
  const percentage = useMemo(() => (
    (value / outOf) * 100
  ), [outOf, value]);

  return (
    <Box position="relative" display="flex" alignItems="center" justifyContent="center">
      <CircularProgress
        size={40}
        value={percentage}
        variant="determinate"
        sx={{ position: 'absolute' }}
        color={value === outOf ? 'success' : 'error'}
      />

      <Typography>{`${value}/${outOf}`}</Typography>
    </Box>
  );
};

export default LobbyRoomCounter;
