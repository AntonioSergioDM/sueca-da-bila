import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsResponse,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class GameGateway {
  @SubscribeMessage('message')
  onPing(client: Socket, payload: any): WsResponse<{message:string}> {
    return {
      event: 'ola',
      data: {
        message: 'pong',
      },
    };
  }
}
