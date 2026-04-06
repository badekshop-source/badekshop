/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    setupFiles: ['./tests/setup.ts'],
    globalSetup: './tests/global-setup.ts',
    environment: 'node',
    // Exclude e2e tests (Playwright)
    exclude: ['e2e/**', 'node_modules/**', 'testsprite_tests/**'],
    // Run tests sequentially to avoid database conflicts (Vitest 4 syntax)
    pool: 'forks',
    // Run each test file in isolation
    fileParallelism: false,
    // Ensure tests run in sequence, not parallel
    sequence: {
      shuffle: false,
      concurrent: false,
    },
    // Timeout for database operations
    testTimeout: 60000,
    hookTimeout: 60000,
    // Isolate each test file
    isolate: true,
  },
});