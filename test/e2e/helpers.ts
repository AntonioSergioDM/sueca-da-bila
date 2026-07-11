/* eslint-disable no-console */
/**
 * End-to-end test harness for the realtime layer.
 *
 * These helpers boot the *real* Socket.IO server the exact same way the app
 * does in production — by invoking the Next.js API route handler in
 * `src/server/socket.ts` against a throwaway `http.Server`. Nothing is mocked:
 * tests connect genuine `socket.io-client` sockets, emit the real typed events,
 * and assert on the events the server broadcasts back. That means the full
 * chain (socket handlers → `Lobby` → `Game` → room emits) is exercised.
 */
import { createServer, type Server as HttpServer } from 'http';
import type { AddressInfo } from 'net';

import { io as ioClient, type Socket as ClientSocket } from 'socket.io-client';

import { SiteRoute } from '@/shared/Routes';
import type { ClientToServerEvents, ServerToClientEvents } from '@/shared/SocketTypes';
// Namespace import so `socketModule.io` is read live after the handler assigns it.
import * as socketModule from '@/server/socket';

/** A client socket typed with our event maps (server↔client are swapped on the client side). */
export type TestClient = ClientSocket<ServerToClientEvents, ClientToServerEvents>;

export type TestServer = {
  httpServer: HttpServer;
  url: string;
  close: () => Promise<void>;
};

/**
 * Start a real Socket.IO server on a random free port. We hand the live
 * `http.Server` to the actual route handler via a minimal fake
 * `NextApiResponse`, so the module-scoped `io` singleton and every event
 * listener are wired up by production code, not by the test.
 */
export async function startTestServer(): Promise<TestServer> {
  const httpServer = createServer();
  await new Promise<void>((resolve) => { httpServer.listen(0, resolve); });
  const { port } = httpServer.address() as AddressInfo;

  const fakeRes = {
    socket: { server: httpServer },
    end: () => {},
  };
  // Drives the real initialization path in src/server/socket.ts.
  socketModule.default({} as never, fakeRes as never);

  return {
    httpServer,
    url: `http://localhost:${port}`,
    close: () => new Promise<void>((resolve) => {
      // The live singleton the handler assigned above.
      socketModule.io?.close();
      httpServer.close(() => resolve());
    }),
  };
}

/** Open a client socket and resolve once it has connected. */
export function connectClient(url: string): Promise<TestClient> {
  const socket: TestClient = ioClient(url, {
    path: SiteRoute.Socket,
    transports: ['websocket'],
    forceNew: true,
  });

  return new Promise((resolve, reject) => {
    socket.on('connect', () => resolve(socket));
    socket.on('connect_error', reject);
  });
}

/** Resolve with the next payload of `event`. */
export function once<E extends keyof ServerToClientEvents>(
  socket: TestClient,
  event: E,
): Promise<Parameters<ServerToClientEvents[E]>> {
  return new Promise((resolve) => {
    socket.once(event as string, (...args: unknown[]) => resolve(args as never));
  });
}

/**
 * Emit an event whose last argument is an acknowledgement callback, and resolve
 * with whatever the server passes to that callback. Works for both the
 * `{ data | error }` responses and the plain positional callbacks.
 */
export function emitAck(
  socket: TestClient,
  event: string,
  ...args: unknown[]
): Promise<any> {
  return new Promise((resolve) => {
    (socket.emit as (...a: unknown[]) => void)(event, ...args, (...res: unknown[]) => {
      resolve(res.length <= 1 ? res[0] : res);
    });
  });
}

/**
 * An unbounded async queue: producers `push`, consumers `await next()`. Used to
 * consume a stream of `gameChange` events one at a time without dropping any
 * that arrive while we're busy playing a card.
 */
export class EventQueue<T> {
  private buffer: T[] = [];

  private waiters: Array<(v: T) => void> = [];

  push(value: T): void {
    const waiter = this.waiters.shift();
    if (waiter) waiter(value);
    else this.buffer.push(value);
  }

  next(): Promise<T> {
    const queued = this.buffer.shift();
    if (queued !== undefined) return Promise.resolve(queued);
    return new Promise((resolve) => { this.waiters.push(resolve); });
  }
}

/** Disconnect a batch of clients and wait a beat for the server to notice. */
export async function disconnectAll(clients: TestClient[]): Promise<void> {
  clients.forEach((c) => c.disconnect());
  await new Promise((resolve) => { setTimeout(resolve, 20); });
}
