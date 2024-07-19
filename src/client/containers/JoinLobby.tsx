import { useCallback, useEffect, useMemo } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/router';

import {
  Stack,
  Button,
  TextField,
  IconButton,
  InputAdornment,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

import { ArrowBack } from '@mui/icons-material';
import { useForm, type SubmitHandler } from 'react-hook-form';

import { SiteRoute } from '@/shared/Routes';

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

    socket.emit('joinLobby', values.lobbyHash, values.playerName, (validHash) => {
      if (validHash) {
        void push(`${SiteRoute.Lobby}/${validHash}`);
      } else {
        alert('failed to join lobby');
      }
    });
  }, [push, socket]);

  const handleClearUsername = useCallback(() => {
    playerNameTools.reset();
    form.setValue('playerName', playerNameTools.get());
  }, [form]);

  return (
    <>
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
    </>
  );
};

export default JoinLobby;
