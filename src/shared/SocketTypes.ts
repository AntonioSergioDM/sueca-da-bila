import type { Socket as SocketIoSocket } from 'socket.io';

import type { Card } from './Card';

export interface ServerToClientEvents {
  lobbyJoined: () => void;
  error: () => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  playerJoined: (playerNames: Array<string>) => void;
  gameStart: (gameState: GameState) => void;
}

export interface ClientToServerEvents {
  joinLobby: (lobbyHash: string, playerName: string, callback: (lobbyHash: string) => void) => void;
  createLobby: (playerName: string, callback: (lobbyHash: string) => void) => void;
  lobbyPlayers: (lobbyHash: string, callback: (lobbyHash: string, players: string[]) => void) => void;
  playerReady: () => void;
}

export type Table = [Card | null, Card | null, Card | null, Card | null];

export type GameState = {
  hand: Array<Card>;
  table: Table;
  trumpCard: Card | null;
  currentPlayer: number;
};

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
