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

import logo from '@/public/favicon.ico';

import { useGamePlayer, useGamePlayers } from '@/client/redux/store';

import Chat from '../Chat';
import ShareUrlButton from '../ShareUrlButton';
import { useSocket } from '../../tools/useSocket';

import LobbyRoomPlayer from './LobbyRoomPlayer';
import LobbyRoomCounter from './LobbyRoomCounter';

type LobbyRoomProps = {
  lobbyHash: string;
};

const LobbyRoom = ({ lobbyHash }: LobbyRoomProps) => {
  const socket = useSocket();

  const player = useGamePlayer()!;
  const players = useGamePlayers();

  const onReady = useCallback(() => {
    socket.emit('playerReady', () => null);
  }, [socket]);

  const missingPlayers = useMemo(() => {
    if (players.length >= 4) return [];

    return Array(4 - players.length).fill(0);
  }, [players.length]);

  const isReady = useMemo(() => (players[player.index]?.ready), [player.index, players]);

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
            {players.map((x) => (
              <LobbyRoomPlayer
                key={`${x.name}-${x.idx}`}
                name={x.name}
                ready={x.ready}
              />
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

      <Chat />
    </Box>
  );
};

export default LobbyRoom;
