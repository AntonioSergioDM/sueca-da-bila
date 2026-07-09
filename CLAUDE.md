# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A realtime multiplayer implementation of **Sueca** (a Portuguese 4-player, 2-team trick-taking card game) built with Next.js (Pages Router), React, and Socket.IO.

## Commands

```bash
npm run dev          # dev server on port 80, loads .env.dev via env-cmd
npm run build        # next build (output: 'standalone')
npm run start        # run the production build
npm run errors       # typecheck + lint (run before considering work done)
npm run errors:types # tsc --noEmit only
npm run errors:lint  # eslint src --fix only (airbnb-typescript config)

docker compose up -d --build   # runs on port 3002
```

There is **no test suite** and no test runner configured. `npm run errors` is the closest thing to a verification gate.

## Environment

`next.config.js` throws at startup if `NODE_ENV` or `NEXT_PUBLIC_URL` are missing. `NEXT_PUBLIC_URL` must match how the client reaches the server (e.g. `http://localhost:80` in dev, `http://localhost:3002` in Docker). `ADMIN_USERNAME`/`ADMIN_PASSWORD` are optional and only enable the Socket.IO admin UI at `/admin`. Dev uses `.env.dev`; Docker/prod uses `.env`.

## Architecture

Three layers under `src/`, kept strictly separated and connected only through `src/shared/`:

- `src/server/` — game engine + Socket.IO handlers (Node only)
- `src/client/` — React `components/`, `containers/` (page-level views), and `tools/` (hooks/helpers)
- `src/shared/` — types and enums imported by both sides (`Card`, `GameTypes`, `SocketTypes`, `Routes`)
- `src/pages/` — Next.js Pages Router; page files are thin and re-export a container

Path aliases (`@/server/*`, `@/client/*`, `@/shared/*`, `@/globals`, `@/public/*`) are defined in `tsconfig.json` — use them instead of relative imports across layers.

### Realtime model — this is the core of the app

- The Socket.IO server is created **lazily** inside the Next.js API route `src/pages/api/socket.ts` → `src/server/socket.ts`. The `io` instance lives in module scope and is initialized on the first HTTP hit to `/api/socket`. The client connects to that same path (`src/client/tools/useSocket.ts`).
- **All game state is in-memory.** `Lobby.lobbies` is a `static Map<string, Lobby>`. There is no database or persistence — restarting the server drops every lobby and game in progress.
- Socket events are fully typed via the `ClientToServerEvents` / `ServerToClientEvents` interfaces in `src/shared/SocketTypes.ts`. **When adding or changing an event, update these interfaces first**, then the handler in `src/server/lobbies.ts` and the `socket.on(...)` wiring in `src/server/socket.ts`, then the client usage.
- Handlers in `src/server/lobbies.ts` are curried: `(socket) => (args..., callback) => {...}`. They resolve the lobby from `socket.data.lobbyHash`/`socket.data.playerId`, delegate to the `Lobby` instance, and reply via the callback.

### Class responsibilities

- **`Lobby`** (`src/server/classes/Lobby.ts`) — owns a set of `Player`s and one `Game`, holds the Socket.IO room, and is the only place that emits to clients (`emitLobbyUpdate`, `emitGameChange`, `emitGameResults`). Orchestrates lifecycle: all players ready → `startGame`; a completed trick schedules `endTurn` on a timer; game end auto-starts the next game after a delay.
- **`Game`** (`src/server/classes/Game.ts`) — pure Sueca rules with no socket/network awareness: dealing, trump selection, turn/trick resolution, scoring, `bandeira`, renúncia. Keep it network-free.
- **`Player`** (`src/server/classes/Player.ts`) — wraps a socket, a uuid `id`, name, and ready flag.

### Card encoding (important, non-obvious)

Sueca uses a 40-card deck. A `Card` (`src/shared/Card.ts`) is `{ suit, value }` where `value` is a **rank index 1–10, not the printed rank**. `10` = Ace, `9` = 7 (the "manilha"), `8` = King, `7` = Jack, `6` = Queen, and `2–5` map to pip cards. Use `cardName()` and `pointsOf()` from `Card.ts` rather than interpreting `value` directly. `Suit` is a 1-based enum (`Diamonds=1 … Clubs=4`). Card image assets live in `public/images/cards/`.

### Scoring conventions

Teams are indexed by player position parity: **even team = players 0 & 2, odd team = players 1 & 3** (`playerIdx % numTeams`). `Score` is `[evenTeam, oddTeam]`. Total points per game = 120 (`Game.maxPoints`), +1 for a `bandeira` (winning every trick). `renounce`/`denounce` implement the renúncia rule (accusing an opponent of failing to follow suit).

## Conventions

- ESLint uses `eslint-config-airbnb-typescript`; `npm run errors:lint` auto-fixes. Server files often disable `no-param-reassign` / `no-console` intentionally.
- Debug logging is gated behind `IN_DEV` (from `@/globals`) — follow that pattern rather than raw `console.*`.
- MUI + Emotion for UI (note `jsxImportSource: "@emotion/react"` in tsconfig), Tailwind is also present, and Framer Motion drives card animations (`src/client/components/FramerGame/`, `AnimatedCard/`).
