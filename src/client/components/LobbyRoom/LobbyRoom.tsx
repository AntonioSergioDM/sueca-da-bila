/* eslint-disable react/no-array-index-key */
import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import Image from 'next/image';

import {
  Box,
  Card,
  Stack,
  Button,
  Container,
} from '@mui/material';

import type { Score } from '@/shared/GameTypes';
import type { LobbyPlayerState } from '@/shared/SocketTypes';

import logo from '@/public/favicon.ico';

import ShareUrlButton from '../ShareUrlButton';
import { useSocket } from '../../tools/useSocket';

import Results from './Results';
import LobbyRoomPlayer from './LobbyRoomPlayer';
import LobbyRoomCounter from './LobbyRoomCounter';

type LobbyRoomProps = {
  lobbyHash: string;
  players: LobbyPlayerState[];
  gameResults?: Score[];
  myIndex?: number | null;
};

const LobbyRoom = ({
  lobbyHash,
  players,
  gameResults = [],
  myIndex = null,
}: LobbyRoomProps) => {
  const socket = useSocket();

  const [playerIndex, setPlayerIndex] = useState<number | null>(null);

  const onReady = useCallback(() => {
    socket.emit('playerReady', (newPlayerIndex) => {
      if (typeof newPlayerIndex === 'number') {
        setPlayerIndex(newPlayerIndex);
      }
    });
  }, [socket]);

  const onUnReady = useCallback(() => {
    socket.emit('playerUnready', (newPlayerIndex) => {
      if (typeof newPlayerIndex === 'number') {
        setPlayerIndex(newPlayerIndex);
      }
    });
  }, [socket]);

  const missingPlayers = useMemo(() => {
    if (players.length >= 4) return [];

    return Array(4 - players.length).fill(0);
  }, [players.length]);

  const isReady = useMemo(() => (
    typeof playerIndex === 'number' && (players[playerIndex]?.ready ?? false)
  ), [playerIndex, players]);

  return (
    <Box
      className="casino-lights"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        position: 'relative',
        overflow: 'auto',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack gap={3} width="100%" maxWidth={gameResults.length ? 700 : 560} mx="auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              className="flex items-center justify-center"
              sx={{
                filter: 'drop-shadow(0 8px 24px rgba(147, 51, 234, 0.4))',
                transition: 'filter 0.3s ease',
                '&:hover': {
                  filter: 'drop-shadow(0 12px 32px rgba(147, 51, 234, 0.6))',
                },
                '& img': {
                  height: 'auto !important',
                  width: 'auto !important',
                  maxWidth: '100%',
                  maxHeight: { xs: 180, sm: 200, md: 240 },
                },
              }}
            >
              <Image alt="Logo" src={logo} priority width={280} height={280} />
            </Box>
          </motion.div>

          <Results gameResults={gameResults} players={players} myIndex={myIndex} />

          <ShareUrlButton lobbyHash={lobbyHash} />

          {/* Players Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="casino-box p-4 sm:p-6" sx={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)' }}>
              <Stack gap={3} style={{ position: 'relative' }}>
                <Stack
                  direction="row"
                  gap={3}
                  useFlexGap
                  flexWrap="wrap"
                  justifyContent="center"
                  alignItems="flex-start"
                >
                  {players.map((player, idx) => (
                    <LobbyRoomPlayer
                      key={`${player.name}-${idx}`}
                      name={player.name}
                      ready={player.ready}
                    />
                  ))}

                  {missingPlayers.map((_, idx) => (
                    <LobbyRoomPlayer key={idx} />
                  ))}
                </Stack>

                <Stack
                  direction="row"
                  gap={3}
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Button
                    onClick={isReady ? onUnReady : onReady}
                    variant="contained"
                    size="large"
                    sx={{
                      minWidth: 150,
                      maxWidth: 220,
                      background: isReady
                        ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                        : 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      borderRadius: 2,
                      boxShadow: isReady
                        ? '0 4px 12px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                        : '0 4px 12px rgba(147, 51, 234, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: isReady
                          ? '0 6px 16px rgba(34, 197, 94, 0.6)'
                          : '0 6px 16px rgba(147, 51, 234, 0.6)',
                      },
                    }}
                  >
                    {isReady ? 'Ready ✓' : 'Ready Up'}
                  </Button>

                  <LobbyRoomCounter
                    value={players.filter((p) => p.ready).length}
                    outOf={4}
                  />
                </Stack>
              </Stack>
            </Card>
          </motion.div>
        </Stack>
      </Container>
    </Box>
  );
};

export default LobbyRoom;
