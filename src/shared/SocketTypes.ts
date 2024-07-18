export interface ServerToClientEvents {
  lobbyJoined: () => void;
  error: () => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

export interface ClientToServerEvents {
  joinLobby: (lobbyHash: string, playerName: string, callback: (hash: string, id: string) => void) => void;
  createLobby: (playerName: string, callback: (hash: string, id: string) => void) => void;
}

/**
 * IDK?
 */
export interface InterServerEvents { }

/**
 * Data sent on connection
 */
export interface SocketData { }
