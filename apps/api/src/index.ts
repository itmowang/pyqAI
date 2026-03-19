import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import tagRoutes from './routes/tags';
import commentRoutes from './routes/comments';
import themeRoutes from './routes/themes';
import likeRoutes from './routes/likes';
import { errorHandler } from './middleware/error';

const app = new Hono();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'Blog API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.route('/api/auth', authRoutes);
app.route('/api/posts', postRoutes);
app.route('/api/tags', tagRoutes);
app.route('/api/comments', commentRoutes);
app.route('/api/themes', themeRoutes);
app.route('/api/likes', likeRoutes);

app.onError(errorHandler);

app.notFound((c) => {
  return c.json({ success: false, error: 'Not Found' }, 404);
});

const port = Number(process.env.PORT) || 3002;

console.log(`🚀 Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
