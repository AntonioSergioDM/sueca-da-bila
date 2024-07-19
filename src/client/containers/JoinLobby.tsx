import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';

import { Button, TextField } from '@mui/material';

import { SiteRoute } from '@/shared/Routes';

import { useInput } from '../tools/useInput';
import { useSocket } from '../tools/useSocket';

const JoinLobby = () => {
  // detect if this player already has an assigned playername in this browser
  // fill it by default in the playerName

  const { query, push } = useRouter();

  const urlLobby = useMemo(() => {
    if (!query?.lobby) return '';

    if (typeof query?.lobby === 'string') return query.lobby;

    return '';
  }, [query.lobby]);

  const [playerName, playerInput] = useInput();
  const [lobbyHash, lobbyHashInput] = useInput(urlLobby);

  const socket = useSocket();

  const onJoin = useCallback(() => {
    socket.emit('joinLobby', lobbyHash, playerName, (validHash) => {
      if (validHash) {
        void push(`${SiteRoute.Lobby}/${validHash}`);
      } else {
        alert('failed to join lobby');
      }
    });
  }, [lobbyHash, playerName, push, socket]);

  return (
    <>
      <TextField {...playerInput} label="Player name" />
      <TextField {...lobbyHashInput} label="Lobby hash" />

      <Button onClick={onJoin}>Join</Button>
    </>
  );
};

export default JoinLobby;
