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
  /** Highlights this seat as the current player. */
  isMe?: boolean;
  /** Marks this seat as the lobby host. */
  isHost?: boolean;
  /** Highlights this seat as picked (first tap of a host swap). */
  selected?: boolean;
  /** When provided, the seat becomes clickable (used to swap seats). */
  onClick?: () => void;
};

const SIZE = 75;
const MAX_WIDTH = 100;

const LobbyRoomPlayer = ({
  name,
  ready,
  isMe = false,
  isHost = false,
  selected = false,
  onClick,
}: LobbyRoomPlayerProps) => {
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
          fontWeight={isMe ? 700 : 400}
        >
          {isHost && '👑 '}
          {isMe ? `${name} (You)` : name}
        </Typography>
      </>
    );
  }, [name, ready, isMe, isHost]);

  const clickable = typeof onClick === 'function';

  let borderColor = 'transparent';
  if (selected) borderColor = '#facc15';
  else if (isMe) borderColor = '#9333ea';

  return (
    <Stack
      gap={2}
      width={MAX_WIDTH}
      height={150}
      flexGrow={1}
      direction="column"
      alignItems="center"
      justifyContent="flex-start"
      onClick={onClick}
      sx={{
        p: 1,
        borderRadius: 2,
        cursor: clickable ? 'pointer' : 'default',
        border: `2px solid ${borderColor}`,
        background: selected ? 'rgba(250, 204, 21, 0.12)' : 'transparent',
        transition: 'all 0.2s ease',
        '&:hover': clickable ? {
          background: 'rgba(147, 51, 234, 0.15)',
          transform: 'translateY(-2px)',
        } : undefined,
      }}
    >
      {content}
    </Stack>
  );
};

export default LobbyRoomPlayer;
