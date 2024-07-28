import { useCallback } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
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
import { joinGame } from '../redux/gameSlice';
import { useSocket } from '../tools/useSocket';
import { useAppDispatch } from '../redux/store';
import FormWrapper from '../components/FormWrapper';
import { playerNameTools } from '../tools/playerNameTools';

type FormValues = {
  playerName: string;
};

const CreateLobby = () => {
  const socket = useSocket();
  const { push } = useRouter();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

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
        dispatch(joinGame(0));
        void push(`${SiteRoute.Game}/${res.data.lobbyHash}`);
      }
    });
  }, [dispatch, enqueueSnackbar, push, socket]);

  const handleClearUsername = useCallback(() => {
    playerNameTools.reset();
    form.setValue('playerName', playerNameTools.get());
  }, [form]);

  return (
    <Layout>
      <Stack alignSelf="flex-start">
        <IconButton LinkComponent={Link} href={SiteRoute.Home}>
          <ArrowBack />
        </IconButton>
      </Stack>

      <FormWrapper {...form} onSuccess={onCreate}>
        <Stack
          gap={3}
          useFlexGap
          maxWidth={350}
          direction="column"
        >
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
        </Stack>
      </FormWrapper>
    </Layout>
  );
};

export default CreateLobby;
