import type { Socket as SocketIoSocket } from 'socket.io';

import type { GameState, PlayerState, Score } from '@/shared/GameTypes';
import type { Card } from './Card';

export type LobbyPlayerState = { name: string; ready: boolean };

export interface ServerToClientEvents {
  error: () => void;
  playersListUpdated: (players: LobbyPlayerState[]) => void;
  gameStart: (playerState: PlayerState) => void;
  gameChange: (gameState: GameState) => void;
  gameReset: () => void;
  gameResults: (gameScore: Score[]) => void;
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
  lobbyPlayers: (lobbyHash: string, callback: (lobbyHash: string, players: LobbyPlayerState[]) => void) => void;
  playerReady: (callback: (playerIndex: number | null) => void) => void;
  playCard: (card: Card, allowRenounce: boolean, callback: (res: GenericCallbackResponse<PlayerState | null>) => void) => void;
  denounce: (playerId: number) => void;
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
