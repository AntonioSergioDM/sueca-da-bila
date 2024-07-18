export interface ServerToClientEvents {
  lobbyJoined: () => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

export interface ClientToServerEvents {
  joinLobby: (lobbyHash: string) => void;
}

/**
 * IDK?
 */
export interface InterServerEvents { }

/**
 * Data sent on connection
 */
export interface SocketData { }