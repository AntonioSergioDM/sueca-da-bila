import {
  useRef,
  useEffect,
  useCallback,
} from 'react';

import { useForm, type SubmitHandler } from 'react-hook-form';

import {
  TextField,
  IconButton,
  InputAdornment,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

import { useSocket } from '@/client/tools/useSocket';
import { useAppChat } from '@/client/redux/store';

import FormWrapper from '../FormWrapper';

import ChatMsg from './ChatMsg';
import { useChatListeners } from './useChatListeners';

type ChatProps = {
  playerIdx: number;
};

const Chat = ({ playerIdx }: ChatProps) => {
  useChatListeners();
  const socket = useSocket();
  const { msgs } = useAppChat();

  const scrollToRef = useRef<HTMLDivElement>(null);

  const form = useForm<{ chat: string }>({ defaultValues: { chat: '' } });

  const onSendMessage = useCallback<SubmitHandler<{ chat: string }>>(({ chat }) => {
    const trimmed = chat.trim();

    if (trimmed) {
      socket.emit('chat:sendMsg', trimmed);
    }

    form.reset();
  }, [form, socket]);

  useEffect(() => {
    if (scrollToRef.current) {
      scrollToRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [msgs.length]);

  return (
    <div className="fixed bottom-4 right-4 w-[500px] h-[400px] rounded-md bg-[rgba(39,21,21,0.7)] border border-red-950 border-solid p-2 flex flex-col justify-between gap-2 z-50">
      <div className="grow flex flex-col gap-[1px] overflow-y-auto">
        {msgs.map((msg, idx) => {
          const isPlayer = 'playerIdx' in msg;

          const nextMsg = msgs[idx + 1] || undefined;
          const connectNext = !!nextMsg && isPlayer && 'playerIdx' in nextMsg && nextMsg?.playerIdx === msg.playerIdx;
          const previousMsg = msgs[idx - 1] || undefined;
          const connectPrevious = !!previousMsg && isPlayer && 'playerIdx' in previousMsg && previousMsg?.playerIdx === msg.playerIdx;

          return (
            <ChatMsg
              key={`${msg.timestamp}${isPlayer ? msg.playerIdx : '-'}`}
              msg={msg}
              connectNext={connectNext}
              connectPrevious={connectPrevious}
              isTheGuy={isPlayer && msg.playerIdx === playerIdx}
            />
          );
        })}

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
