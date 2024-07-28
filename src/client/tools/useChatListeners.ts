import { useCallback, useEffect } from 'react';

import { addMsg } from '@/client/redux/chatSlice';
import { useSocket } from '@/client/tools/useSocket';
import { useAppDispatch } from '@/client/redux/store';
import type { ServerToClientEvents } from '@/shared/SocketTypes';

export const useChatListeners = () => {
  const socket = useSocket();
  const dispatch = useAppDispatch();

  const onSystemMsg = useCallback<ServerToClientEvents['chat:systemMsg']>((systemMsg) => {
    dispatch(addMsg({
      type: systemMsg.type,
      timestamp: systemMsg.timestamp,
      playerIdx: systemMsg.playerIdx,
    }));
  }, [dispatch]);

  const onPlayerMsg = useCallback<ServerToClientEvents['chat:playerMsg']>((playerMsg) => {
    dispatch(addMsg({
      type: 'playerMsg',
      timestamp: playerMsg.timestamp,
      playerIdx: playerMsg.playerIdx,
      content: playerMsg.content,
    }));
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
