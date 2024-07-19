import { useCallback, useEffect, useMemo } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/router';

import {
  Stack,
  Button,
  TextField,
  IconButton,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useForm, type SubmitHandler } from 'react-hook-form';

import { SiteRoute } from '@/shared/Routes';

import { useSocket } from '../tools/useSocket';
import FormWrapper from '../components/FormWrapper';

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
      playerName: '',
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
    socket.emit('joinLobby', values.lobbyHash, values.playerName, (validHash) => {
      if (validHash) {
        void push(`${SiteRoute.Lobby}/${validHash}`);
      } else {
        alert('failed to join lobby');
      }
    });
  }, [push, socket]);

  return (
    <>
      <Stack alignItems="flex-end">
        <IconButton LinkComponent={Link} href={SiteRoute.Home}>
          <ArrowBack />
        </IconButton>
      </Stack>

      <FormWrapper {...form} onSuccess={onJoin}>
        <TextField
          {...form.register('playerName', { required: true })}
          label="Player name"
        />
        <TextField
          {...form.register('lobbyHash', { required: true })}
          label="Lobby hash"
        />

        <Button type="submit">Join</Button>
      </FormWrapper>
    </>
  );
};

export default JoinLobby;
