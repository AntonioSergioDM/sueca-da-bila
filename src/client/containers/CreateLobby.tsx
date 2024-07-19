import { useCallback } from 'react';
import { useRouter } from 'next/router';

import { Button, TextField } from '@mui/material';
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
      console.log(`Created lobby with hash: ${hash}`);
      if (hash) {
        void push(`${SiteRoute.Lobby}/${hash}`);
      } else {
        alert('failed to create lobby or failed to get hash');
      }
    });
  }, [push, socket]);

  return (
    <FormWrapper {...form} onSuccess={onCreate}>
      <TextField
        {...form.register('playerName', { required: true })}
        label="Player name"
      />

      <Button type="submit">Create</Button>
    </FormWrapper>
  );
};

export default CreateLobby;
