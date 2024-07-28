import { useMemo } from 'react';

import clsx from 'clsx';
import dayjs from 'dayjs';
import { Typography } from '@mui/material';

import { useGameState } from '@/client/redux/store';
import type { ChatMsg as ReduxChatMsg } from '@/client/redux/chatSlice';

type ChatMsgProps = {
  msg: ReduxChatMsg;
  /** The player in front of the goddamn screen */
  isTheGuy: boolean;
  connectNext: boolean;
  connectPrevious: boolean;
};

const ChatMsg = (props: ChatMsgProps) => {
  const {
    msg,
    isTheGuy,
    connectNext,
    connectPrevious,
  } = props;

  const { players } = useGameState();

  const systemMsgContent = useMemo(() => {
    if (msg.type === 'playerMsg') return '';

    switch (msg.type) {
      case 'gameEnded':
        return 'Game ended';

      case 'gameStarted':
        return 'Game started';

      case 'playerJoined':
        if (typeof msg.playerIdx !== 'number') return 'Player joined!';

        return `Player ${players[msg.playerIdx].name} joined!`;

      case 'playerLeft':
        if (typeof msg.playerIdx !== 'number') return 'Player left!';

        return `Player ${players[msg.playerIdx].name} left!`;

      default:
        return '';
    }
  }, [msg, players]);

  return (
    <div className="flex flex-col px-2">

      {msg.type === 'playerMsg' ? (
        <>
          {!connectPrevious && (
            <Typography variant="caption" textAlign={isTheGuy ? 'right' : 'left'}>
              {players[msg.playerIdx!].name}
            </Typography>
          )}

          <div
            className={clsx(
              'rounded-lg flex flex-row max-w-[80%] p-[6px] gap-3 items-end',
              isTheGuy && 'bg-red-800 self-end text-right',
              !isTheGuy && 'bg-[#633131] self-start text-left',
              connectNext && isTheGuy && 'rounded-br-none',
              connectNext && !isTheGuy && 'rounded-bl-none',
              connectPrevious && isTheGuy && 'rounded-tr-none',
              connectPrevious && !isTheGuy && 'rounded-tl-none',
              !connectNext && 'mb-1',
            )}
          >
            <Typography>{msg.content}</Typography>

            <Typography variant="caption" className="-mb-[6px] text-gray-400">
              {dayjs(msg.timestamp).format('HH:mm')}
            </Typography>
          </div>
        </>
      ) : (
        // event msg
        <div className="self-center text-center mb-1">
          <Typography variant="caption" className="text-gray-400">
            {dayjs(msg.timestamp).format('HH:mm')}
          </Typography>

          <Typography variant="body2">{systemMsgContent}</Typography>
        </div>
      )}
    </div>
  );
};

export default ChatMsg;
