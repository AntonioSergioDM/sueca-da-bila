import type { LobbyChatMsg } from '@/shared/SocketTypes';
import { Typography } from '@mui/material';
import clsx from 'clsx';
import dayjs from 'dayjs';

type ChatMsgProps = {
  msg: LobbyChatMsg;
  isPlayer: boolean;
  connectNext: boolean;
  connectPrevious: boolean;
};

const ChatMsg = (props: ChatMsgProps) => {
  const {
    msg,
    isPlayer,
    connectNext,
    connectPrevious,
  } = props;

  return (
    <div className="flex flex-col px-2">
      {!connectPrevious && (
        <Typography variant="caption" textAlign={isPlayer ? 'right' : 'left'}>
          {msg.from}
        </Typography>
      )}

      {msg.from ? (
        <div
          className={clsx(
            'rounded-lg flex flex-row max-w-[80%] p-[6px] gap-3 items-end',
            isPlayer && 'bg-red-800 self-end text-right',
            !isPlayer && 'bg-[#633131] self-start text-left',
            connectNext && isPlayer && 'rounded-br-none',
            connectNext && !isPlayer && 'rounded-bl-none',
            connectPrevious && isPlayer && 'rounded-tr-none',
            connectPrevious && !isPlayer && 'rounded-tl-none',
            !connectNext && 'mb-1',
          )}
        >
          <Typography>{msg.msg}</Typography>

          <Typography variant="caption" className="-mb-[6px] text-gray-400">
            {dayjs(msg.time).format('HH:mm')}
          </Typography>
        </div>
      ) : (
        // event msg
        <div className="self-center text-center mb-1">
          <Typography variant="caption" className="text-gray-400">
            {dayjs(msg.time).format('HH:mm')}
          </Typography>

          <Typography variant="body2">{msg.msg}</Typography>
        </div>
      )}
    </div>
  );
};

export default ChatMsg;
