import { Socket } from 'Socket.IO';
import { Card } from '../../shared/Card';
import { v4 as uuid } from 'uuid';


export default class Player {
    id:string;
    name:string;
    cards:Array<Card> = [];
    socket: Socket

    constructor(socket:Socket, name?:string) {
        this.socket = socket;
        this.name = name || '';
        this.id = uuid();
    }
}