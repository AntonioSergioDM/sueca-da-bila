import { useCallback, useEffect, useMemo } from 'react';

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
    <Layout>
      <Stack alignItems="flex-start">
        <IconButton LinkComponent={Link} href={SiteRoute.Home}>
          <ArrowBack />
        </IconButton>
      </Stack>

      <FormWrapper {...form} onSuccess={onJoin}>
        <TextField
          autoFocus
          label="Player name"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClearUsername}
                  edge="end"
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
          {...form.register('lobbyHash', { required: true })}
        />

        <Button type="submit">Join</Button>
      </FormWrapper>
    </Layout>
  );
};

export default JoinLobby;
