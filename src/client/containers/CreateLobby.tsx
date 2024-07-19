import { useCallback } from 'react';
import { useRouter } from 'next/router';

import { Button, TextField } from '@mui/material';

import { SiteRoute } from '@/shared/Routes';

import { useInput } from '../tools/useInput';
import { useSocket } from '../tools/useSocket';

const CreateLobby = () => {
  const socket = useSocket();
  const { push } = useRouter();
  const [playerName, input] = useInput();

  const onCreate = useCallback(() => {
    socket.emit('createLobby', playerName, (hash) => {
      console.log(`Created lobby with hash: ${hash}`);
      if (hash) {
        void push(`${SiteRoute.Lobby}/${hash}`);
      } else {
        alert('failed to create lobby or failed to get hash');
      }
    });
  }, [playerName, push, socket]);

  return (
    <>
      <TextField {...input} label="Player name" />

      <Button onClick={onCreate}>Create</Button>
    </>
  );
};

export default CreateLobby;
