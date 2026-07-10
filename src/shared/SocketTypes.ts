import type { Socket as SocketIoSocket } from 'socket.io';

import type { GameState, PlayerState, Score } from '@/shared/GameTypes';
import type { Message } from '@/shared/Message';
import type { Card } from './Card';

export type LobbyPlayerState = { name: string; ready: boolean; isHost: boolean };

export interface ServerToClientEvents {
  error: () => void;
  playersListUpdated: (players: LobbyPlayerState[]) => void;
  /** Pushed to each socket individually with that player's current seat index (teams are seat-parity based). */
  seatUpdate: (index: number) => void;
  gameStart: (playerState: PlayerState) => void;
  gameChange: (gameState: GameState) => void;
  gameReset: () => void;
  gameResults: (gameScore: Score[]) => void;
  message: (message: Message) => void;
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
  lobbyPlayers: (lobbyHash: string, callback: (lobbyHash: string, players: LobbyPlayerState[], myIndex: number) => void) => void;
  playerReady: (callback: (playerIndex: number | null) => void) => void;
  playerUnready: (callback: (playerIndex: number | null) => void) => void;
  /** Host-only: swap two occupied seats, rearranging the 2v2 teams. */
  swapSeat: (indexA: number, indexB: number, callback: (res: GenericCallbackResponse<{ ok: true }>) => void) => void;
  /** Host-only: shuffle every seat to form random teams. */
  randomizeTeams: (callback: (res: GenericCallbackResponse<{ ok: true }>) => void) => void;
  playCard: (card: Card, allowRenounce: boolean, callback: (res: GenericCallbackResponse<PlayerState | null>) => void) => void;
  hideTrump: () => void;
  denounce: (playerId: number) => void;
  message: (message: Message) => void;
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
