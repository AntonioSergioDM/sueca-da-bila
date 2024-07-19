import type { Socket } from 'Socket.IO';
import { v4 as uuid } from 'uuid';
import type { Card } from '../../shared/Card';

export default class Player {
  id:string;

  name:string;

  cards:Array<Card> = [];

  socket: Socket;

  constructor(socket:Socket, name?:string) {
    this.socket = socket;
    this.name = name || '';
    this.id = uuid();
  }
}
