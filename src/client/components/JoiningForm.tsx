import { useCallback, useEffect } from 'react';

import Link from 'next/link';
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

import { useSocket } from '../tools/useSocket';
import { playerNameTools } from '../tools/playerNameTools';

import Layout from './Layout';
import FormWrapper from './FormWrapper';
import { joinGame } from '../redux/gameSlice';
import { useAppDispatch } from '../redux/store';

type FormValues = {
  playerName: string;
  lobbyHash: string;
};

type JoiningFormProps = {
  lobbyHash: string;
};

const JoiningForm = ({ lobbyHash }: JoiningFormProps) => {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const form = useForm<FormValues>({
    defaultValues: {
      playerName: playerNameTools.get(),
      lobbyHash: '',
    },
  });

  useEffect(() => {
    if (lobbyHash) form.reset({ lobbyHash });
  }, [form, lobbyHash]);

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
        dispatch(joinGame(res.data.playerIdx));
      }
    });
  }, [dispatch, enqueueSnackbar, socket]);

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

      <FormWrapper {...form} onSuccess={onJoin}>
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
          <TextField
            label="Lobby hash"
            {...form.register('lobbyHash', { required: true })}
          />

          <Button type="submit">Join</Button>
        </Stack>
      </FormWrapper>
    </Layout>
  );
};

export default JoiningForm;
