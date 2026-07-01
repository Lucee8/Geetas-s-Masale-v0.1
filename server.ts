/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
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
    app.use(express.static(distPath));
    // Support SPA router fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Geeta's Spices server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
