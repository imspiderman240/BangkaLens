import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: process.env.DISABLE_HMR !== 'true',
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        explore: path.resolve(__dirname, 'explore.html'),
        profile: path.resolve(__dirname, 'profile.html'),
        jobs: path.resolve(__dirname, 'jobs.html'),
        createJob: path.resolve(__dirname, 'create-job.html'),
        login: path.resolve(__dirname, 'login.html'),
      },
    },
  },
});
