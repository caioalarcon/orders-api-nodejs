const logger = require('../config/logger');

function errorHandler(err, req, res, next) {
  logger.error({ err }, 'Unhandled error');

  if (err.status) {
    return res.status(err.status).json({ message: err.message });
  }

  return res.status(500).json({ message: 'Internal server error' });
}

module.exports = errorHandler;
