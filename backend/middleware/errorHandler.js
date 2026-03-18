function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message || 'Server error',
    ...(process.env.NODE_ENV === 'production'
      ? null
      : { stack: err.stack, name: err.name }),
  });
}

module.exports = { notFound, errorHandler };

