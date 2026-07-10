/* eslint-disable react/no-array-index-key */
import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';

import Link from 'next/link';
import Image from 'next/image';

import {
  Box,
  Card,
  Stack,
  Button,
  Container,
  Typography,
} from '@mui/material';

import type { Score } from '@/shared/GameTypes';
import type { LobbyPlayerState } from '@/shared/SocketTypes';

import logo from '@/public/favicon.ico';
import { SiteRoute } from '@/shared/Routes';

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

// Teams are seat-parity based: seats 0 & 2 form one team, seats 1 & 3 the other.
const TEAMS: number[][] = [[0, 2], [1, 3]];

const LobbyRoom = ({
  lobbyHash,
  players,
  gameResults = [],
  myIndex = null,
}: LobbyRoomProps) => {
  const socket = useSocket();
  const { enqueueSnackbar } = useSnackbar();

  // Only the host arranges the teams. First tap selects a seat, second tap on
  // another seat swaps the two.
  const isHost = useMemo(() => (
    typeof myIndex === 'number' && (players[myIndex]?.isHost ?? false)
  ), [myIndex, players]);

  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  // Drop any pending selection if we stop being the host (e.g. when the host
  // role is handed over) or the selected seat is no longer occupied.
  useEffect(() => {
    if (!isHost || (selectedSeat !== null && !players[selectedSeat])) {
      setSelectedSeat(null);
    }
  }, [isHost, selectedSeat, players]);

  const onReady = useCallback(() => {
    socket.emit('playerReady', () => {});
  }, [socket]);

  const onUnReady = useCallback(() => {
    socket.emit('playerUnready', () => {});
  }, [socket]);

  const onSeatClick = useCallback((seatIdx: number) => {
    setSelectedSeat((current) => {
      if (current === null) {
        return seatIdx;
      }

      if (current === seatIdx) {
        return null;
      }

      socket.emit('swapSeat', current, seatIdx, (res) => {
        if (res.error) {
          enqueueSnackbar({ variant: 'error', message: res.error });
        }
      });

      return null;
    });
  }, [socket, enqueueSnackbar]);

  const onRandomize = useCallback(() => {
    setSelectedSeat(null);
    socket.emit('randomizeTeams', (res) => {
      if (res.error) {
        enqueueSnackbar({ variant: 'error', message: res.error });
      }
    });
  }, [socket, enqueueSnackbar]);

  const isReady = useMemo(() => (
    typeof myIndex === 'number' && (players[myIndex]?.ready ?? false)
  ), [myIndex, players]);

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
            <Link href={SiteRoute.Home} className="flex items-center justify-center">
              <Box
                className="flex items-center justify-center"
                sx={{
                  cursor: 'pointer',
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
            </Link>
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
                  direction={{ xs: 'column', sm: 'row' }}
                  gap={3}
                  useFlexGap
                  justifyContent="center"
                  alignItems="stretch"
                >
                  {TEAMS.map((seats, teamIdx) => (
                    <Stack
                      key={teamIdx}
                      gap={1}
                      flex={1}
                      alignItems="center"
                      sx={{
                        background: 'rgba(0, 0, 0, 0.25)',
                        borderRadius: 2,
                        p: 2,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          fontWeight: 700,
                          color: teamIdx === 0 ? '#60a5fa' : '#f472b6',
                        }}
                      >
                        {`Team ${teamIdx + 1}`}
                      </Typography>

                      <Stack direction="row" gap={2} justifyContent="center">
                        {seats.map((seatIdx) => {
                          const player = players[seatIdx];
                          const isMe = seatIdx === myIndex;
                          // Only the host arranges seats, and only occupied ones.
                          const canSelect = isHost && !!player;

                          return (
                            <LobbyRoomPlayer
                              key={seatIdx}
                              name={player?.name}
                              ready={player?.ready}
                              isMe={isMe}
                              isHost={player?.isHost}
                              selected={selectedSeat === seatIdx}
                              onClick={canSelect ? () => onSeatClick(seatIdx) : undefined}
                            />
                          );
                        })}
                      </Stack>
                    </Stack>
                  ))}
                </Stack>

                {isHost && (
                  <Stack alignItems="center" gap={1}>
                    <Button
                      onClick={onRandomize}
                      variant="outlined"
                      disabled={players.length < 2}
                      sx={{
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.3)',
                        textTransform: 'none',
                        '&:hover': { borderColor: 'white', background: 'rgba(255,255,255,0.08)' },
                      }}
                    >
                      🎲 Randomize Teams
                    </Button>
                    {players.length > 1 && (
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        {selectedSeat === null
                          ? 'You are the host — tap two players to swap their seats'
                          : 'Now tap another player to swap'}
                      </Typography>
                    )}
                  </Stack>
                )}

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
