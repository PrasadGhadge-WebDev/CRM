const logger = require('../utils/logger');

function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  
  logger.error(`API Error: ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server error',
    data: null,
    ...(process.env.NODE_ENV === 'production' ? null : { stack: err.stack })
  });
}

module.exports = { notFound, errorHandler };
