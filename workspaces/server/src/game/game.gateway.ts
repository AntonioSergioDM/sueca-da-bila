import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsResponse,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ServerEvents } from '@shared/server/ServerEvents';
import { ClientEvents } from '@shared/client/ClientEvents';

@WebSocketGateway()
export class GameGateway
{
  @SubscribeMessage(ClientEvents.Ping)
  onPing(client: Socket): WsResponse<{ message: string }>
  {
    // This is the NestJS way of returning data to the exact same client, notice the return type as well
    return {
      event: ServerEvents.Pong,
      data: {
        message: 'pong',
      },
    };
  }
}
