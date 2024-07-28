import { useCallback, useEffect } from 'react';

import { useSocket } from '@/client/tools/useSocket';
import { useAppDispatch } from '@/client/redux/store';
import type { ServerToClientEvents } from '@/shared/SocketTypes';
import { addMsg } from '@/client/redux/chatSlice';

export const useChatListeners = () => {
  const socket = useSocket();
  const dispatch = useAppDispatch();

  const onSystemMsg = useCallback<ServerToClientEvents['chat:systemMsg']>((systemMsg) => {
    dispatch(addMsg(systemMsg));
  }, [dispatch]);

  const onPlayerMsg = useCallback<ServerToClientEvents['chat:playerMsg']>((playerMsg) => {
    dispatch(addMsg(playerMsg));
  }, [dispatch]);

  useEffect(() => {
    socket.on('chat:systemMsg', onSystemMsg);
    socket.on('chat:playerMsg', onPlayerMsg);

    return () => {
      socket.off('chat:systemMsg', onSystemMsg);
      socket.off('chat:playerMsg', onPlayerMsg);
    };
  }, [onSystemMsg, onPlayerMsg, socket]);
};
