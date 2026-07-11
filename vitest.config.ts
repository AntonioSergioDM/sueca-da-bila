import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

const src = (p: string) => resolve(__dirname, 'src', p);

export default defineConfig({
  // Mirror the `@/…` path aliases from tsconfig.json. Defined here (rather than
  // via a tsconfig-paths plugin) because the test files live outside the
  // tsconfig `include`, which such plugins honour and would therefore skip.
  resolve: {
    alias: [
      { find: /^@\/globals$/, replacement: src('globals.ts') },
      { find: /^@\/server\/(.*)$/, replacement: src('server/$1') },
      { find: /^@\/shared\/(.*)$/, replacement: src('shared/$1') },
      { find: /^@\/client\/(.*)$/, replacement: src('client/$1') },
      { find: /^@\/public\/(.*)$/, replacement: resolve(__dirname, 'public/$1') },
    ],
  },
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
    // Real sockets + timers: give each file room and run files serially so the
    // in-memory `Lobby.lobbies` singleton isn't shared across parallel workers.
    testTimeout: 20000,
    hookTimeout: 20000,
    pool: 'forks',
    fileParallelism: false,
  },
});
