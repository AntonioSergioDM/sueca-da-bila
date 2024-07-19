import { v4 as uuid } from 'uuid';
import type { Room } from 'socket.io-adapter';

import type { OurServerSocket } from '@/shared/SocketTypes';

import { io } from '../socket';

export default class Player {
  id: string;

  name: string;

  socket: OurServerSocket;

  constructor(socket: OurServerSocket, name?: string) {
    this.socket = socket;
    this.name = name || '';
    this.id = uuid();
  }

  async joinRoom(room: Room) {
    await this.socket.join(room);

    return io?.to(room) || null;
  }
}
