import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import type { KeyboardEventHandler } from 'react';

import {
  Box, IconButton, InputAdornment, TextField,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

import dayjs from 'dayjs';

import type { LobbyChatMsg, ServerToClientEvents } from '@/shared/SocketTypes';

import { useSocket } from '@/client/tools/useSocket';

const Chat = () => {
  const socket = useSocket();
  const inputRef = useRef<HTMLInputElement>();

  const [msgs, setMsgs] = useState<LobbyChatMsg[]>([]);

  const onChatMsg = useCallback<ServerToClientEvents['chatMsg']>((msg) => {
    setMsgs((prev) => ([...prev, msg]));
  }, []);

  const handleSubmit = useCallback(() => {
    if (inputRef.current?.value) {
      socket.emit('chatMsg', inputRef.current.value.trim());
      inputRef.current.value = '';
    }
  }, [socket]);

  useEffect(() => {
    socket.on('chatMsg', onChatMsg);

    return () => {
      socket.off('chatMsg', onChatMsg);
    };
  }, [onChatMsg, socket]);

  const handleKeyDown = useCallback<KeyboardEventHandler<HTMLDivElement>>((event) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <Box position="absolute" width={400} height={300} right={0} bottom={0} margin={5} display="flex" flexDirection="column" border="1px solid red">
      <Box border="1px solid green" flexGrow={1} overflow="auto">
        {msgs.map((msg) => (
          <Box display="flex" flexDirection="row" key={`${msg.time}${msg.from}`}>
            <Box mr={1}>{dayjs(msg.time).format('HH:mm:ss')}</Box>
            <Box mr={1}>{msg.from || ''}</Box>
            <Box>{msg.msg}</Box>
          </Box>
        ))}
      </Box>
      <Box>
        <TextField
          inputRef={inputRef}
          placeholder="Type your message here"
          fullWidth
          onKeyDown={handleKeyDown}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleSubmit}
                  edge="end"
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Box>
  );
};

export default Chat;
