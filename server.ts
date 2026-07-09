/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/api';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use body parsing with responsive byte limits for raw base64 uploads
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Serve uploads or public assets if custom images are stored on-disk
  const uploadsPath = path.join(process.cwd(), 'server', 'uploads');
  app.use('/server/uploads', express.static(uploadsPath));

  // Mount API router FIRST
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Hot module replacement or dev-production setups
  if (process.env.NODE_ENV !== 'production') {
    console.log('Initializing Vite dev-middleware server...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Serving production-built static assets...');
    const distPath = path.join(process.cwd(), 'dist');
    // Disable automatic serving of index.html so the fallback get('*') can run and inject environment variables at runtime
    app.use(express.static(distPath, { index: false }));
    // Support SPA router fallback and inject server-side env variables
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      try {
        let html = fs.readFileSync(indexPath, 'utf8');
        
        // Find configuration from process.env (supports both exact lowercase names, standard uppercase ones, and VITE_ prefixed ones)
        const fbConfig = {
          apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || process.env.apiKey || process.env.API_KEY || '',
          authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || process.env.authDomain || process.env.AUTH_DOMAIN || '',
          projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || process.env.projectId || process.env.PROJECT_ID || '',
          storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || process.env.storageBucket || process.env.STORAGE_BUCKET || '',
          messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.messagingSenderId || process.env.MESSAGING_SENDER_ID || '',
          appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || process.env.appId || process.env.APP_ID || '',
          measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID || process.env.measurementId || process.env.MEASUREMENT_ID || ''
        };
        
        if (fbConfig.apiKey && fbConfig.projectId) {
          const injectScript = `<script>window.__FIREBASE_CONFIG__ = ${JSON.stringify(fbConfig)};</script>`;
          html = html.replace('<head>', `<head>${injectScript}`);
        }
        
        res.send(html);
      } catch (err) {
        res.sendFile(indexPath);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Geeta's Spices server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
