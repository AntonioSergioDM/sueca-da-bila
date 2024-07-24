import type { Socket as SocketIoSocket } from 'socket.io';

import type { GameState, PlayerState, Score } from '@/shared/GameTypes';
import type { Card } from './Card';

export type LobbyPlayerState = { name: string; ready: boolean };

export type LobbyChatMsg = {
  /** ISO STRING DATE+TIME */
  time: string;
  from: string | null;
  msg: string;
};

export interface ServerToClientEvents {
  error: () => void;
  playersListUpdated: (players: LobbyPlayerState[]) => void;
  gameStart: (playerState: PlayerState) => void;
  gameChange: (gameState: GameState) => void;
  gameReset: () => void;
  gameResults: (gameScore: Score[]) => void;
  chatMsg: (data: LobbyChatMsg) => void;
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
  playCard: (card: Card, callback: (res: GenericCallbackResponse<PlayerState | null>) => void) => void;
  chatMsg: (msg: string) => void;
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
