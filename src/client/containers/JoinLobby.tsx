import { useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

import Link from 'next/link';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/router';
import { useForm, type SubmitHandler } from 'react-hook-form';

import {
  Stack,
  Button,
  TextField,
  IconButton,
  InputAdornment,
  Box,
  Container,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import RefreshIcon from '@mui/icons-material/Refresh';

import { SiteRoute } from '@/shared/Routes';

import Layout from '../components/Layout';
import { useSocket } from '../tools/useSocket';
import FormWrapper from '../components/FormWrapper';
import { playerNameTools } from '../tools/playerNameTools';

type FormValues = {
  playerName: string;
  lobbyHash: string;
};

const JoinLobby = () => {
  // detect if this player already has an assigned playername in this browser
  // fill it by default in the playerName
  const { enqueueSnackbar } = useSnackbar();

  const { query, push } = useRouter();

  const urlLobby = useMemo(() => {
    if (!query?.lobby) return '';

    if (typeof query?.lobby === 'string') return query.lobby;

    return '';
  }, [query.lobby]);

  const form = useForm<FormValues>({
    defaultValues: {
      playerName: playerNameTools.get(),
      lobbyHash: '',
    },
  });

  useEffect(() => {
    if (urlLobby) {
      form.reset({ lobbyHash: urlLobby });
    }
  }, [form, urlLobby]);

  const socket = useSocket();

  const onJoin = useCallback<SubmitHandler<FormValues>>((values) => {
    playerNameTools.set(values.playerName);

    socket.emit('joinLobby', values.lobbyHash, values.playerName, (res) => {
      if (typeof res.error === 'string') {
        enqueueSnackbar({
          variant: 'error',
          message: res.error,
        });
      } else {
        void push(`${SiteRoute.Game}/${res.data.lobbyHash}`);
      }
    });
  }, [enqueueSnackbar, push, socket]);

  const handleClearUsername = useCallback(() => {
    playerNameTools.reset();
    form.setValue('playerName', playerNameTools.get());
  }, [form]);

  return (
    <Box
      className="casino-lights"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)',
          animation: 'pulse-glow 4s ease-in-out infinite',
        }}
      />

      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Layout>
            <Stack alignItems="flex-start" width="100%">
              <IconButton
                LinkComponent={Link}
                href={SiteRoute.Home}
                sx={{
                  background: 'rgba(147, 51, 234, 0.2)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(147, 51, 234, 0.3)',
                  color: '#a855f7',
                  '&:hover': {
                    background: 'rgba(147, 51, 234, 0.3)',
                    transform: 'translateX(-4px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <ArrowBack />
              </IconButton>
            </Stack>

            <FormWrapper {...form} onSuccess={onJoin}>
              <TextField
                autoFocus
                label="Player name"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(8px)',
                    '& fieldset': {
                      borderColor: 'rgba(147, 51, 234, 0.5)',
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(147, 51, 234, 0.7)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#9333ea',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-focused': {
                      color: '#a855f7',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                    fontSize: '1.1rem',
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClearUsername}
                        edge="end"
                        sx={{
                          color: '#a855f7',
                          '&:hover': {
                            background: 'rgba(147, 51, 234, 0.2)',
                          },
                        }}
                      >
                        <RefreshIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                {...form.register('playerName', { required: true })}
              />
              <TextField
                label="Lobby hash"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(8px)',
                    '& fieldset': {
                      borderColor: 'rgba(147, 51, 234, 0.5)',
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(147, 51, 234, 0.7)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#9333ea',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-focused': {
                      color: '#a855f7',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                    fontSize: '1.1rem',
                    fontFamily: 'monospace',
                  },
                }}
                {...form.register('lobbyHash', { required: true })}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  padding: '16px 48px',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  boxShadow: '0 8px 24px rgba(147, 51, 234, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                    boxShadow: '0 12px 32px rgba(147, 51, 234, 0.6), inset 0 1px 0 rgba(255,255,255,0.3)',
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                }}
              >
                Join
              </Button>
            </FormWrapper>
          </Layout>
        </motion.div>
      </Container>
    </Box>
  );
};

export default JoinLobby;
