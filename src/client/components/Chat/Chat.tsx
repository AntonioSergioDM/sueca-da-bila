import {
  useRef,
  useEffect,
  useCallback,
  useState,
} from 'react';

import {
  TextField,
  IconButton,
  InputAdornment,
} from '@mui/material';
import clsx from 'clsx';
import SendIcon from '@mui/icons-material/Send';
import { ChatBubble, Minimize } from '@mui/icons-material';
import { useForm, type SubmitHandler } from 'react-hook-form';

import { useSocket } from '@/client/tools/useSocket';
import { useGameChat, useGamePlayer } from '@/client/redux/store';
import { useChatListeners } from '@/client/tools/useChatListeners';

import FormWrapper from '../FormWrapper';

import ChatMsg from './ChatMsg';
import styles from './Chat.module.css';

const Chat = () => {
  useChatListeners();
  const socket = useSocket();
  const { msgs } = useGameChat();
  const { index } = useGamePlayer()!;

  const [open, setOpen] = useState(false);
  const scrollToRef = useRef<HTMLDivElement>(null);

  const form = useForm<{ chat: string }>({ defaultValues: { chat: '' } });

  useEffect(() => {
    if (scrollToRef.current) {
      scrollToRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [msgs.length]);

  const onSendMessage = useCallback<SubmitHandler<{ chat: string }>>(({ chat }) => {
    const trimmed = chat.trim();

    if (trimmed) {
      socket.emit('chat:sendMsg', trimmed);
    }

    form.reset();
  }, [form, socket]);

  const onToggleChat = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  return (
    <div
      className={clsx(
        styles.chat,
        !open && styles.chatClosed,
      )}
    >
      {open && (
        <>
          <div className="grow flex flex-col gap-[1px] overflow-y-auto">
            {msgs.map((msg, idx) => {
              const isPlayerMsg = msg.type === 'playerMsg';

              const nextMsg = msgs[idx + 1] || undefined;
              const nextIsPlayerMsg = nextMsg?.type === 'playerMsg';
              const connectNext = !!nextMsg && isPlayerMsg && nextIsPlayerMsg && nextMsg?.playerIdx === msg.playerIdx;

              const previousMsg = msgs[idx - 1] || undefined;
              const previousIsPlayerMsg = previousMsg?.type === 'playerMsg';
              const connectPrevious = !!previousMsg && isPlayerMsg && previousIsPlayerMsg && previousMsg?.playerIdx === msg.playerIdx;

              return (
                <ChatMsg
                  key={`${msg.timestamp}${isPlayerMsg ? msg.playerIdx : '-'}`}
                  msg={msg}
                  connectNext={connectNext}
                  connectPrevious={connectPrevious}
                  isTheGuy={isPlayerMsg && msg.playerIdx === index}
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
        </>
      )}

      <IconButton className="absolute left-0 top-0" onClick={onToggleChat}>
        {open ? <Minimize /> : <ChatBubble />}
      </IconButton>
    </div>
  );
};

export default Chat;
