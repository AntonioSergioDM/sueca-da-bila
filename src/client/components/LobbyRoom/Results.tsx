import { useMemo } from 'react';
import { motion } from 'framer-motion';

import {
  Box,
  Card,
  Chip,
  Stack,
  Avatar,
  Divider,
  Typography,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import type { Score } from '@/shared/GameTypes';
import type { LobbyPlayerState } from '@/shared/SocketTypes';

import getInitials from '@/client/tools/getInitials';
import { bestOfThree } from '@/client/tools/printScore';
import { computeMatchStats, valesFor } from '@/client/tools/gameStats';

type ResultsProps = {
  gameResults: Score[];
  players: LobbyPlayerState[];
  myIndex: number | null;
};

const TEAM_LABELS = ['Team 1', 'Team 2'];
const TEAM_COLORS = ['#7C3AED', '#0EA5E9'];

type TeamPanelProps = {
  teamIdx: number;
  members: string[];
  lastPoints: number;
  won: boolean;
  isMine: boolean;
  gamesWon: number;
  vales: number;
  cardPoints: number;
};

const TeamPanel = ({
  teamIdx,
  members,
  lastPoints,
  won,
  isMine,
  gamesWon,
  vales,
  cardPoints,
}: TeamPanelProps) => {
  const color = TEAM_COLORS[teamIdx];

  return (
    <Card
      sx={{
        flex: 1,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        border: `2px solid ${won ? color : 'transparent'}`,
        boxShadow: won ? `0 0 16px ${color}66` : undefined,
        background: 'rgba(255, 255, 255, 0.04)',
      }}
    >
      <Stack direction="row" alignItems="center" gap={1}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ color }}>
          {TEAM_LABELS[teamIdx]}
        </Typography>
        {won && <EmojiEventsIcon sx={{ color: '#FFD166', fontSize: 20 }} />}
        {isMine && <Chip label="You" size="small" color="secondary" sx={{ height: 20 }} />}
      </Stack>

      <Stack direction="row" gap={1} flexWrap="wrap">
        {members.map((name) => (
          <Stack key={name} direction="row" alignItems="center" gap={0.75}>
            <Avatar sx={{
              width: 26, height: 26, bgcolor: color, fontSize: 12,
            }}
            >
              {getInitials(name)}
            </Avatar>
            <Typography variant="body2" noWrap maxWidth={90}>{name}</Typography>
          </Stack>
        ))}
      </Stack>

      <Box textAlign="center" py={0.5}>
        <Typography variant="h3" fontWeight={800} sx={{ color: won ? color : 'text.primary', lineHeight: 1 }}>
          {lastPoints}
        </Typography>
        <Typography variant="caption" color="text.secondary">points this game</Typography>
      </Box>

      <Divider />

      <Stack direction="row" justifyContent="space-around" textAlign="center">
        <Box>
          <Typography variant="h6" fontWeight={700}>{gamesWon}</Typography>
          <Typography variant="caption" color="text.secondary">games</Typography>
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700}>{vales}</Typography>
          <Typography variant="caption" color="text.secondary">vales</Typography>
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700}>{cardPoints}</Typography>
          <Typography variant="caption" color="text.secondary">total pts</Typography>
        </Box>
      </Stack>
    </Card>
  );
};

const Results = ({ gameResults, players, myIndex }: ResultsProps) => {
  const stats = useMemo(() => computeMatchStats(gameResults), [gameResults]);

  const pad = useMemo(
    () => bestOfThree(gameResults, (myIndex ?? 0) % 2 === 1),
    [gameResults, myIndex],
  );

  if (!gameResults.length || players.length < 4) {
    return null;
  }

  const lastGame = gameResults[gameResults.length - 1] || [0, 0];
  const evenVales = valesFor(lastGame[0]);
  const oddVales = valesFor(lastGame[1]);

  let winnerTeam: number | null = null;
  if (evenVales > oddVales) winnerTeam = 0;
  else if (oddVales > evenVales) winnerTeam = 1;

  const myTeam = myIndex === null ? null : myIndex % 2;

  let headline = "It's a tie!";
  if (winnerTeam !== null) {
    if (myTeam === null) {
      headline = `${TEAM_LABELS[winnerTeam]} wins the game`;
    } else {
      headline = winnerTeam === myTeam ? 'You won the game! 🎉' : 'You lost this one 😔';
    }
  }

  const teamMembers: [string[], string[]] = [
    [players[0]?.name, players[2]?.name].filter(Boolean) as string[],
    [players[1]?.name, players[3]?.name].filter(Boolean) as string[],
  ];

  return (
    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card sx={{
        p: 2.5, display: 'flex', flexDirection: 'column', gap: 2,
      }}
      >
        <Typography variant="h5" fontWeight={800} textAlign="center">
          {headline}
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
          {([0, 1] as const).map((teamIdx) => (
            <TeamPanel
              key={teamIdx}
              teamIdx={teamIdx}
              members={teamMembers[teamIdx]}
              lastPoints={lastGame[teamIdx]}
              won={winnerTeam === teamIdx}
              isMine={myTeam === teamIdx}
              gamesWon={stats.teams[teamIdx].gamesWon}
              vales={stats.teams[teamIdx].vales}
              cardPoints={stats.teams[teamIdx].cardPoints}
            />
          ))}
        </Stack>

        {gameResults.length >= 1 && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              {`Match history (${stats.gamesPlayed} games)`}
            </Typography>
            <Box
              sx={{
                mt: 0.5,
                p: 1,
                borderRadius: 1,
                bgcolor: 'rgba(0,0,0,0.35)',
                overflowX: 'auto',
              }}
            >
              {[pad.top, pad.middleTop, pad.middle, pad.middleBottom, pad.bottom].map((line, idx) => (
                <Typography
                  // eslint-disable-next-line react/no-array-index-key
                  key={idx}
                  className="font-mono"
                  sx={{ whiteSpace: 'pre', fontSize: 10, lineHeight: 1.15 }}
                >
                  {line}
                </Typography>
              ))}
            </Box>
          </Box>
        )}
      </Card>
    </motion.div>
  );
};

export default Results;
