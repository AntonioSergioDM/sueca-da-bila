import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import { useForm, type SubmitHandler } from 'react-hook-form';

import {
  TextField,
  IconButton,
  InputAdornment,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

import { useSocket } from '@/client/tools/useSocket';
import type { LobbyChatMsg, ServerToClientEvents } from '@/shared/SocketTypes';
import FormWrapper from '../FormWrapper';
import ChatMsg from './ChatMsg';

type ChatProps = {
  playerName: string;
};

const Chat = ({ playerName }: ChatProps) => {
  const socket = useSocket();

  const scrollToRef = useRef<HTMLDivElement>(null);
  const [msgs, setMsgs] = useState<LobbyChatMsg[]>([]);

  const form = useForm<{ chat: string }>({ defaultValues: { chat: '' } });

  const onSendMessage = useCallback<SubmitHandler<{ chat: string }>>(({ chat }) => {
    if (chat.trim()) {
      socket.emit('chatMsg', chat.trim());
    }

    form.reset();
  }, [form, socket]);

  const onNewChatMsg = useCallback<ServerToClientEvents['chatMsg']>((msg) => {
    setMsgs((prev) => ([...prev, msg]));
  }, []);

  useEffect(() => {
    socket.on('chatMsg', onNewChatMsg);

    return () => {
      socket.off('chatMsg', onNewChatMsg);
    };
  }, [onNewChatMsg, socket]);

  useEffect(() => {
    if (scrollToRef.current) {
      scrollToRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [msgs.length]);

  return (
    <div className="fixed bottom-4 right-4 w-[500px] h-[400px] rounded-md bg-[rgba(39,21,21,0.7)] border border-red-950 border-solid p-2 flex flex-col justify-between gap-2 z-50">
      <div className="grow flex flex-col gap-[1px] overflow-y-auto">
        {msgs.map((msg, idx) => (
          <ChatMsg
            key={`${msg.time}${msg.from}`}
            msg={msg}
            isPlayer={msg.from === playerName}
            connectNext={!!msg.from && msgs[idx + 1]?.from === msg.from}
            connectPrevious={!!msg.from && msgs[idx - 1]?.from === msg.from}
          />
        ))}

        <div ref={scrollToRef} />
      </div>

      <FormWrapper {...form} onSuccess={onSendMessage}>
        <TextField
          {...form.register('chat')}
          fullWidth
          color="info"
          variant="standard"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton type="submit">
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </FormWrapper>
    </div>
  );
};

export default Chat;
