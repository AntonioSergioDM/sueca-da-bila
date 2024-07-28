/* eslint-disable max-classes-per-file */

export class ChatMsg {
  timestamp: string;

  constructor(timestamp?: string) {
    this.timestamp = timestamp || new Date().toISOString();
  }
}

export class ChatPlayerMsg extends ChatMsg {
  playerIdx: number;

  content: string;

  constructor(idx: number, content: string, timestamp?: string) {
    super(timestamp);

    this.playerIdx = idx;
    this.content = content;
  }
}

type SystemMsgType = 'playerJoined' | 'playerLeft' | 'gameStarted' | 'gameEnded';

export class ChatSystemMsg extends ChatMsg {
  type: SystemMsgType;

  playerIdx?: number;

  constructor(type: SystemMsgType, idx?: number, timestamp?: string) {
    super(timestamp);

    this.type = type;
    this.playerIdx = idx;
  }
}
