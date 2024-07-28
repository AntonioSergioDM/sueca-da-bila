/* eslint-disable no-param-reassign */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { ChatMsg } from '@/shared/Chat';

export type ChatState = {
  msgs: ChatMsg[];
};

const initialState: ChatState = {
  msgs: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMsg: (state: ChatState, action: PayloadAction<ChatMsg>) => {
      state.msgs.push(action.payload);
    },
  },
});

export const {
  addMsg,
} = chatSlice.actions;

export default chatSlice;
