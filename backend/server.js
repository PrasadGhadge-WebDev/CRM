 const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./utils/logger');
const apiResponse = require('./middleware/apiResponse');

const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { requireDb } = require('./middleware/requireDb');

dotenv.config();

const setupReminders = require('./utils/reminders');
const app = express();

// Initialize task reminders
setupReminders();

app.use(morgan('dev'));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: Boolean(process.env.CORS_ORIGIN),
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(apiResponse);

app.get('/health', (_req, res) => res.ok({ status: 'UP' }));

app.use('/api', requireDb);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/master-data', require('./routes/masterData'));
app.use('/api/users', require('./routes/users'));
app.use('/api/metrics', require('./routes/metrics'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/products', require('./routes/products'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/deals', require('./routes/deals'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/support', require('./routes/support'));
app.use('/api/workflow', require('./routes/workflow'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/attachments', require('./routes/attachments'));
app.use('/api/search', require('./routes/search'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`API listening on http://localhost:${PORT}`);
});

let dbConnecting = false;
async function connectWithRetry() {
  if (dbConnecting) return;
  if (mongoose.connection.readyState === 1) return;
  dbConnecting = true;
  try {
    await connectDB();
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection failed, retrying in 5s:', err.message || err);
    setTimeout(() => {
      dbConnecting = false;
      connectWithRetry();
    }, 50000);
    return;
  }
  dbConnecting = false;
}

connectWithRetry();
