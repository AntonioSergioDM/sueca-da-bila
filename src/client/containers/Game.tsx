import { useMemo } from 'react';

import { useRouter } from 'next/router';

import { useGameState } from '../redux/store';
import LobbyRoom from '../components/LobbyRoom';
import FramerGame from '../components/FramerGame';
import JoiningForm from '../components/JoiningForm';
import { useGameListeners } from '../tools/useGameListeners';
import RenounceOverlay from '../components/RenounceOverlay';

const Game = () => {
  const { query } = useRouter();
  const [renounceOverlayState, setRenounceOverlayState] = useState<Card | null>(null);
  const lobbyHash = useMemo(() => {
    if (!query?.lobby) return '';

    if (typeof query?.lobby === 'string') return query.lobby;

    return '';
  }, [query.lobby]);

  useGameListeners(lobbyHash);

  const { joined, gameRunning } = useGameState();

  return joined ? (
  const onPlayCard = useCallback((card: Card, allowRenounce = false) => {
    socket.emit('playCard', card, allowRenounce, (res) => {
      if (typeof res.error === 'string') {
        enqueueSnackbar({
          variant: 'error',
          message: res.error,
        });

        if (res.error === PlayErrors.mustAssist) {
          setRenounceOverlayState(card);
        }
      } else {
        setPlayerState(res.data);
      }
    });
  }, [enqueueSnackbar, socket]);

    <>
      {!gameRunning && (
        <LobbyRoom lobbyHash={lobbyHash} />
      )}

      {gameRunning && (
        <FramerGame />
      )}
      <RenounceOverlay card={renounceOverlayState} onClose={() => setRenounceOverlayState(null)} onPlayCard={onPlayCard} />
    </>
  ) : (
    <JoiningForm lobbyHash={lobbyHash} />
  );
};

export default Game;
