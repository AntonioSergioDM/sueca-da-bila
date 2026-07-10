import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  TextField,
} from '@mui/material';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { SendOutlined } from '@mui/icons-material';
import type { Message } from '@/shared/Message';
import { MessageType } from '@/shared/Message';

interface ChatDialogProps {
  open: boolean;
  onClose: () => void;
  messages: Message[];
  sendMessage: (msg: string) => void;
}

export const ChatDialog = (props: ChatDialogProps) => {
  const {
    open,
    onClose,
    messages,
    sendMessage,
  } = props;

  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  // scroll to end
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, open]);

  const renderMessage = (msg: Message) => {
    let content: ReactNode = msg.msg;

    const date = new Date();
    date.setTime(msg.timestamp || 0);
    const time = [date.getHours(), date.getMinutes(), date.getSeconds()].map((n) => n.toString().padStart(2, '0')).join(':');

    switch (msg.type) {
      case MessageType.message:
      case MessageType.whisper:
        content = (
          <div className={`w-fit max-w-[80%] flex flex-col gap-1 ${!msg.from ? 'items-end ml-auto' : 'items-start'}`}>
            <div className="text-xxs italic px-2 mt-1">
              {msg.from || 'You'}
              {msg.type === MessageType.whisper && ' (whisper)'}
            </div>
            <div className={`flex ${!msg.from ? 'flex-row-reverse' : 'flex-row'} gap-1 items-end`}>
              <div className={`${msg.type === MessageType.whisper ? 'bg-sueca-disabled' : 'bg-sueca-highlight'} bg-opacity-40 px-4 py-1 rounded-3xl text-start`}>
                {msg.msg}
              </div>
              {msg.timestamp && (
                <div className="text-xxs ml-auto mr-2">
                  {time}
                </div>
              )}
            </div>
          </div>
        );
        break;

      case MessageType.reminder:
        content = (
          <div className="w-full flex flex-col gap-1 items-center mt-2">
            {msg.timestamp ? <div className="text-xxs mr-2">{time}</div> : null}
            <div className="text-xxs text-center">
              {`🔔 ${msg.from || 'Someone'} is reminding you to play 🔔`}
            </div>
          </div>
        );
        break;

      default:
        content = (
          <div className="w-full flex flex-col gap-1 items-center mt-2">
            {msg.timestamp ? <div className="text-xxs mr-2">{time}</div> : null}
            <div className="text-xxs text-center">{msg.msg}</div>
          </div>
        );
        break;
    }

    return (
      <ListItem key={msg.timestamp} className="m-0 p-1">
        {content}
      </ListItem>
    );
  };

  return (
    <Dialog
      keepMounted
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        className: 'casino-box max-w-[90vw] w-96 h-1/3 max-h-[50vh] absolute -right-3 top-4 p-4',
      }}
    >
      <DialogContent className="p-0">
        <Box className="overflow-y-auto flex flex-col justify-between">
          <List>
            {messages.map(renderMessage)}
          </List>
          <div ref={messagesEndRef} />
        </Box>
      </DialogContent>
      <DialogActions className="p-0">
        <TextField
          autoFocus
          margin="dense"
          id="message"
          label="Message"
          type="text"
          fullWidth
          variant="outlined"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleSend}
                  edge="end"
                >
                  <SendOutlined />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#FACC15', // sueca-highlight
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
            },
          }}
        />
      </DialogActions>
    </Dialog>
  );
};
