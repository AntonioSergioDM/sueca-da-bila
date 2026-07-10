import { useMemo } from 'react';

import {
  Stack,
  Avatar,
  Skeleton,
  Typography,
  Badge,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import getInitials from '../../tools/getInitials';

type LobbyRoomPlayerProps = {
  name?: string;
  ready?: boolean;
  /** Highlights this seat as the current player. */
  isMe?: boolean;
  /** Marks this seat as the lobby host. */
  isHost?: boolean;
  /** Marks this seat as an engine-driven bot. */
  isBot?: boolean;
  /** Highlights this seat as picked (first tap of a host swap). */
  selected?: boolean;
  /** When provided, the seat becomes clickable (used to swap seats). */
  onClick?: () => void;
  /** When provided (host viewing another seat), shows a control to kick that player. */
  onKick?: () => void;
};

const SIZE = 75;
export const MAX_WIDTH = 120;

const LobbyRoomPlayer = ({
  name,
  ready,
  isMe = false,
  isHost = false,
  isBot = false,
  selected = false,
  onClick,
  onKick,
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
          // Bottom-right so the ready dot never sits under the kick button in
          // the card's top-right corner.
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          color={ready ? 'success' : 'error'}
        >
          <Avatar sx={{ width: SIZE, height: SIZE }}>
            <Typography variant="h5">{getInitials(name)}</Typography>
          </Avatar>
        </Badge>

        {/* Let long names wrap onto more lines (and break unbroken words)
            instead of overflowing the card sideways. */}
        <Typography
          variant="body2"
          textAlign="center"
          fontWeight={isMe ? 700 : 400}
          title={name}
          sx={{
            width: '100%',
            maxWidth: MAX_WIDTH,
            lineHeight: 1.25,
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
          }}
        >
          {isHost && '👑 '}
          {isBot && '🤖 '}
          {name}
          {isMe && ' (You)'}
        </Typography>
      </>
    );
  }, [name, ready, isMe, isHost, isBot]);

  const clickable = typeof onClick === 'function';

  let borderColor = 'transparent';
  if (selected) borderColor = '#facc15';
  else if (isMe) borderColor = '#9333ea';

  return (
    <Stack
      gap={1.5}
      width="100%"
      maxWidth={MAX_WIDTH}
      minWidth={0}
      minHeight={165}
      direction="column"
      alignItems="center"
      justifyContent="flex-start"
      onClick={onClick}
      sx={{
        p: 1,
        borderRadius: 2,
        position: 'relative',
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
      {onKick && (
        <IconButton
          aria-label="Remove player"
          title="Remove player"
          // Stop both events: the seat is itself clickable (to swap teams), and
          // without this the tap bubbles up and selects the seat instead.
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onKick();
          }}
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            zIndex: 2,
            width: 28,
            height: 28,
            padding: 0,
            color: '#fff',
            backgroundColor: 'rgba(220, 38, 38, 0.92)',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
            transition: 'transform 0.15s ease, background-color 0.15s ease',
            '&:hover': {
              backgroundColor: '#dc2626',
              transform: 'scale(1.12)',
            },
            '& svg': { fontSize: 17 },
          }}
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
      )}
      {content}
    </Stack>
  );
};

export default LobbyRoomPlayer;
