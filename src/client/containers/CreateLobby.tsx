import { useCallback } from 'react';

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
};

const CreateLobby = () => {
  const socket = useSocket();
  const { push } = useRouter();

  const form = useForm<FormValues>({
    defaultValues: { playerName: '' },
  });

  const onCreate = useCallback<SubmitHandler<FormValues>>((values) => {
    socket.emit('createLobby', values.playerName, (hash) => {
      if (hash) {
        void push(`${SiteRoute.Lobby}/${hash}`);
      } else {
        alert('failed to create lobby or failed to get hash');
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

      <FormWrapper {...form} onSuccess={onCreate}>
        <TextField
          autoFocus
          label="Player name"
          {...form.register('playerName', { required: true })}
        />

        <Button type="submit">Create</Button>
      </FormWrapper>
    </>
  );
};

export default CreateLobby;
