import { useCallback, useMemo } from 'react';

import Link from 'next/link';
import Image from 'next/image';

import {
  Box,
  Card,
  Stack,
  Button,
} from '@mui/material';

import { SiteRoute } from '@/shared/Routes';
import type { LobbyPlayerState } from '@/shared/SocketTypes';

import logo from '@/public/favicon.ico';

import Chat from '../Chat';
import ShareUrlButton from '../ShareUrlButton';
import { useSocket } from '../../tools/useSocket';

import LobbyRoomPlayer from './LobbyRoomPlayer';
import LobbyRoomCounter from './LobbyRoomCounter';

type LobbyRoomProps = {
  lobbyHash: string;
  playerIdx: number;
  players: LobbyPlayerState[];
};

const LobbyRoom = ({ lobbyHash, playerIdx, players }: LobbyRoomProps) => {
  const socket = useSocket();

  const onReady = useCallback(() => {
    socket.emit('playerReady', () => null);
  }, [socket]);

  const missingPlayers = useMemo(() => {
    if (players.length >= 4) return [];

    return Array(4 - players.length).fill(0);
  }, [players.length]);

  // TODO: keep in mind idx is 0 coming from the parent component
  // we need to have proper idx
  const isReady = useMemo(() => (players[playerIdx]?.ready), [playerIdx, players]);

  return (
    <Box
      margin={5}
      height="90vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Stack gap={1} width="100%" maxWidth={500}>
        <Link href={SiteRoute.Home} style={{ alignSelf: 'center' }}>
          <Image alt="Logo" src={logo} priority width={200} height={200} />
        </Link>

        <ShareUrlButton lobbyHash={lobbyHash} />

        <Card
          sx={{
            p: 2,
            gap: 3,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Stack direction="row" gap={2}>
            {players.map((player, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <LobbyRoomPlayer key={`${player.name}-${idx}`} name={player.name} ready={player.ready} />
            ))}

            {missingPlayers.map((_, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <LobbyRoomPlayer key={idx} />
            ))}
          </Stack>

          <Stack px={1} direction="row" gap={5} justifyContent="space-between" alignItems="center">
            <Button
              onClick={onReady}
              disabled={isReady}
              sx={{ maxWidth: 100 }}
            >
              Ready
            </Button>

            <LobbyRoomCounter value={players.filter((p) => p.ready).length} outOf={4} />
          </Stack>
        </Card>
      </Stack>

      <Chat playerIdx={playerIdx} />
    </Box>
  );
};

export default LobbyRoom;
