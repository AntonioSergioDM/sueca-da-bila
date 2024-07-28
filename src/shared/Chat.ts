/* eslint-disable max-classes-per-file */

export class ChatMsg {
  timestamp: string;

  constructor() {
    this.timestamp = new Date().toISOString();
  }
}

export class ChatPlayerMsg extends ChatMsg {
  playerIdx: number;

  content: string;

  constructor(idx: number, content: string) {
    super();

    this.playerIdx = idx;
    this.content = content;
  }
}

type SystemMsgType = 'playerJoined' | 'playerLeft' | 'gameStarted' | 'gameEnded';

export class ChatSystemMsg extends ChatMsg {
  type: SystemMsgType;

  playerIdx?: number;

  constructor(type: SystemMsgType, idx?: number) {
    super();

    this.type = type;
    this.playerIdx = idx;
  }
}
