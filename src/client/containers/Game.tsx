import { useMemo } from 'react';

import { useRouter } from 'next/router';

import { useGameState } from '../redux/store';
import LobbyRoom from '../components/LobbyRoom';
import FramerGame from '../components/FramerGame';
import JoiningForm from '../components/JoiningForm';
import { useGameListeners } from '../tools/useGameListeners';

const Game = () => {
  const { query } = useRouter();

  const lobbyHash = useMemo(() => {
    if (!query?.lobby) return '';

    if (typeof query?.lobby === 'string') return query.lobby;

    return '';
  }, [query.lobby]);

  useGameListeners(lobbyHash);

  const { joined, gameRunning } = useGameState();

  if (!joined) {
    return <JoiningForm lobbyHash={lobbyHash} />;
  }

  return (
    <>
      {!gameRunning && <LobbyRoom lobbyHash={lobbyHash} />}

      {gameRunning && <FramerGame />}
    </>
  );
};

export default Game;
