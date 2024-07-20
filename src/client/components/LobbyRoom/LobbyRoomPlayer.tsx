import { useMemo } from 'react';

import {
  Stack,
  Avatar,
  Skeleton,
  Typography,
  Badge,
} from '@mui/material';

import getInitials from '../../tools/getInitials';

type LobbyRoomPlayerProps = {
  name?: string;
  ready?: boolean;
};

const SIZE = 75;
const MAX_WIDTH = 100;

const LobbyRoomPlayer = ({ name, ready }: LobbyRoomPlayerProps) => {
  const content = useMemo(() => {
    if (!name) {
      return (
        <>
          <Skeleton variant="circular" width={SIZE} height={SIZE} />

          <Skeleton variant="rounded" width={SIZE} height={25} />
        </>
      );
    }

    return (
      <>
        <Badge
          badgeContent=" "
          overlap="circular"
          color={ready ? 'success' : 'error'}
        >
          <Avatar sx={{ width: SIZE, height: SIZE }}>
            <Typography variant="h5">{getInitials(name)}</Typography>
          </Avatar>
        </Badge>

        <Typography
          variant="body1"
          textAlign="center"
          overflow="hidden"
          maxWidth={MAX_WIDTH}
        >
          {name}
        </Typography>
      </>
    );
  }, [name, ready]);

  return (
    <Stack
      gap={2}
      width={MAX_WIDTH}
      height={150}
      flexGrow={1}
      direction="column"
      alignItems="center"
      justifyContent="flex-start"
    >
      {content}
    </Stack>
  );
};

export default LobbyRoomPlayer;
