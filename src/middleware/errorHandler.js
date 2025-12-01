const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error('Unhandled error', {
    err,
    method: req.method,
    path: req.originalUrl,
  });

  if (err.status) {
    return res.status(err.status).json({ message: err.message });
  }

  return res.status(500).json({ message: 'Internal server error' });
}

module.exports = errorHandler;
