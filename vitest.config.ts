/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Tillåt globala API:er som describe, it, expect
    environment: 'jsdom', // Använd jsdom för att simulera webbläsare
    setupFiles: './vitest.setup.ts', // (Valfritt) Fil för global setup, t.ex. importera matchers
    // Exkludera node_modules och andra irrelevanta kataloger
    exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/cypress/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*'
    ],
    // För att lösa sökvägsalias som @/
    alias: {
      '@': path.resolve(__dirname, './'), // Peka på roten eftersom det inte finns en src-katalog
    },
  },
}); 