const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { requireDb } = require('./middleware/requireDb');

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: Boolean(process.env.CORS_ORIGIN),
  }),
);
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api', requireDb);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/metrics', require('./routes/metrics'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/leads', require('./routes/leads'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${PORT}`);
});

let dbConnecting = false;
async function connectWithRetry() {
  if (dbConnecting) return;
  if (mongoose.connection.readyState === 1) return;
  dbConnecting = true;
  try {
    await connectDB();
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection failed, retrying in 5s:', err.message || err);
    setTimeout(() => {
      dbConnecting = false;
      connectWithRetry();
    }, 5000);
    return;
  }
  dbConnecting = false;
}

connectWithRetry();
