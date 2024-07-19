import type { Socket as SocketIoSocket } from 'socket.io';

export interface ServerToClientEvents {
  lobbyJoined: () => void;
  error: () => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  playerJoined: (playerNames:Array<string>) => void;
}

export interface ClientToServerEvents {
  joinLobby: (lobbyHash: string, playerName: string, callback: (lobbyHash: string) => void) => void;
  createLobby: (playerName: string, callback: (lobbyHash: string) => void) => void;
  lobbyPlayers: (lobbyHash: string, callback: (lobbyHash: string, players: string[]) => void) => void;
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

export type Socket = SocketIoSocket<any, any, any, SocketData>;
