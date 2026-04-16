import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initSchema } from './db/database.js';
import productsRouter from './routes/products.js';
import cartRouter     from './routes/cart.js';
import ordersRouter   from './routes/orders.js';
import wishlistRouter from './routes/wishlist.js';
import authRouter     from './routes/auth.js';
import paymentsRouter from './routes/payments.js';
import primeRouter    from './routes/prime.js';
import supportRouter  from './routes/support.js';
import webhooksRouter from './routes/webhooks.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  allowedOrigins.push(
    /^http:\/\/localhost(:\d+)?$/,
    /^http:\/\/127\.0\.0\.1(:\d+)?$/
  );
}

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const allowed = allowedOrigins.some((entry) => (
      entry instanceof RegExp ? entry.test(origin) : entry === origin
    ));

    if (allowed) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhooksRouter);
app.use(express.json());

// ── Initialise DB (runs schema on first start) ──────────────────────────────
initSchema().catch(console.error);

// ── Routes ─────────────────────────────────────────────────────────────────────
app.get('/api/categories', async (_req, res) => {
  try {
    // getDb is no longer returning a synchronous db object, we just import query directly
    const { query } = await import('./db/database.js');
    const result = await query('SELECT * FROM categories ORDER BY id');
    res.json({ categories: result.rows });
  } catch(err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.use('/api/auth',     authRouter);

app.use('/api/products', productsRouter);
app.use('/api/cart',     cartRouter);
app.use('/api/orders',   ordersRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/prime',    primeRouter);
app.use('/api/support',  supportRouter);

// ── v1 Real-World Style Aliases (keeps old endpoints backward compatible) ───
app.use('/api/v1/auth',               authRouter);
app.use('/api/v1/catalog/products',   productsRouter);
app.use('/api/v1/me/cart',            cartRouter);
app.use('/api/v1/me/orders',          ordersRouter);
app.use('/api/v1/me/wishlist',        wishlistRouter);
app.use('/api/v1/checkout/payments',  paymentsRouter);
app.use('/api/v1/me/prime',           primeRouter);
app.use('/api/v1/support',            supportRouter);

app.get('/api/v1/catalog/categories', async (_req, res) => {
  try {
    const { query } = await import('./db/database.js');
    const result = await query('SELECT * FROM categories ORDER BY id');
    res.json({ categories: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── 404 handler ────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

// ── Error handler ──────────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Amazon Clone API running at http://localhost:${PORT}`);
  console.log(`📦 Health: http://localhost:${PORT}/api/health`);
});

server.on('error', (err) => {
  if (err?.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the existing process or run with a different PORT.`);
    process.exit(1);
  }

  throw err;
});
