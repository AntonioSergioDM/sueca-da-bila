import type { Socket as SocketIoSocket } from 'socket.io';

import type { GameState, Hand } from '@/shared/GameTypes';
import type { Card } from './Card';

export interface ServerToClientEvents {
  lobbyJoined: () => void;
  error: () => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  playerJoined: (playerNames: Array<string>) => void;
  gameStart: (hand: Hand) => void;
  gameChange: (gameState: GameState) => void;
}

export interface ClientToServerEvents {
  joinLobby: (lobbyHash: string, playerName: string, callback: (lobbyHash: string) => void) => void;
  createLobby: (playerName: string, callback: (lobbyHash: string) => void) => void;
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
