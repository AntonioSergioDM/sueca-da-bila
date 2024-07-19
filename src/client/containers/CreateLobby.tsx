import { useCallback } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/router';

import {
  Stack,
  Button,
  TextField,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import RefreshIcon from '@mui/icons-material/Refresh';
import { ArrowBack } from '@mui/icons-material';
import { useForm, type SubmitHandler } from 'react-hook-form';

import { SiteRoute } from '@/shared/Routes';

import { useSocket } from '../tools/useSocket';
import FormWrapper from '../components/FormWrapper';
import { playerNameTools } from '../tools/playerNameTools';

type FormValues = {
  playerName: string;
};

const CreateLobby = () => {
  const { enqueueSnackbar } = useSnackbar();
  const socket = useSocket();
  const { push } = useRouter();

  const form = useForm<FormValues>({
    defaultValues: { playerName: playerNameTools.get() },
  });

  const onCreate = useCallback<SubmitHandler<FormValues>>((values) => {
    playerNameTools.set(values.playerName);

    socket.emit('createLobby', values.playerName, (res) => {
      if (typeof res.error === 'string') {
        enqueueSnackbar({
          variant: 'error',
          message: res.error,
        });
      } else {
        void push(`${SiteRoute.Lobby}/${res.data.lobbyHash}`);
      }
    });
  }, [enqueueSnackbar, push, socket]);

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

      <FormWrapper {...form} onSuccess={onCreate}>
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

        <Button type="submit">Create</Button>
      </FormWrapper>
    </>
  );
};

export default CreateLobby;
