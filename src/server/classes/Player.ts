import type { Socket } from 'Socket.IO';
import { v4 as uuid } from 'uuid';
import type { Room } from "socket.io-adapter";
import { io } from '../socket';

export default class Player {
  id:string;

  name:string;
  socket: Socket;

  constructor(socket:Socket, name?:string) {
    this.socket = socket;
    this.name = name || '';
    this.id = uuid();
  }

  joinRoom(room: Room) {
    this.socket.join(room);
    return io?.to(room) || null;
  }
}
