import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chatRouter from './routes/chat.js';
import searchRouter from './routes/search.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

const isProduction = process.env.NODE_ENV === 'production';
app.use(cors({ origin: isProduction ? false : 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/chat', chatRouter);
app.use('/api/search', searchRouter);

// In production, serve the React build from Express
if (isProduction) {
  const clientDist = join(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(join(clientDist, 'index.html')));
}

// Global error handler — catches anything a route didn't handle
app.use((err, req, res, _next) => {
  console.error('[unhandled]', err);
  res.status(500).json({ error: err.message || 'Unexpected server error' });
});

// Prevent Node from crashing on unhandled rejections — log and keep running
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`ANTHROPIC_API_KEY set: ${!!process.env.ANTHROPIC_API_KEY}`);
  console.log(`TAVILY_API_KEY set: ${!!process.env.TAVILY_API_KEY}`);
});
