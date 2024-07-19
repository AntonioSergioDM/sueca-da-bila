import type { Socket as SocketIoSocket } from 'socket.io';

import type { GameState, PlayerState } from '@/shared/GameTypes';
import type { Card } from './Card';

export interface ServerToClientEvents {
  lobbyJoined: () => void;
  error: () => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  playerJoined: (playerNames: Array<string>) => void;
  gameStart: (playerState: PlayerState) => void;
  gameChange: (gameState: GameState) => void;
  gameReset: () => void;
}

type GenericCallbackResponse<T = any> = {
  data: T;
  error?: never;
} | {
  data?: T;
  error: string;
};

export interface ClientToServerEvents {
  joinLobby: (lobbyHash: string, playerName: string, callback: (res: GenericCallbackResponse<{ lobbyHash: string }>) => void) => void;
  createLobby: (playerName: string, callback: (res: GenericCallbackResponse<{ lobbyHash: string }>) => void) => void;
  leaveLobby: () => void;
  lobbyPlayers: (lobbyHash: string, callback: (lobbyHash: string, players: string[]) => void) => void;
  playerReady: () => void;
  playCard: (card: Card, callback: (sucess: boolean) => void) => void;
}

/**
 * IDK?
 */
export interface InterServerEvents { }

/**
 * Data sent on connection
*/
export interface SocketData {
  lobbyHash: string | null;
  playerId: string | null;
}

export type OurServerSocket = SocketIoSocket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
