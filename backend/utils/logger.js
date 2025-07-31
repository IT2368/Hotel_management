// 📁 backend/utils/logger.js

/**
 * Simple logger utility for the staff management system
 */

const getTimestamp = () => {
  return new Date().toISOString();
};

const formatMessage = (level, message, data = null) => {
  const timestamp = getTimestamp();
  const logEntry = {
    timestamp,
    level: level.toUpperCase(),
    message
  };

  if (data) {
    logEntry.data = data;
  }

  return JSON.stringify(logEntry);
};

export const logger = {
  /**
   * Log info message
   * @param {string} message - Log message
   * @param {any} data - Additional data
   */
  info: (message, data = null) => {
    console.log(formatMessage('info', message, data));
  },

  /**
   * Log warning message
   * @param {string} message - Log message
   * @param {any} data - Additional data
   */
  warn: (message, data = null) => {
    console.warn(formatMessage('warn', message, data));
  },

  /**
   * Log error message
   * @param {string} message - Log message
   * @param {any} data - Additional data
   */
  error: (message, data = null) => {
    console.error(formatMessage('error', message, data));
  },

  /**
   * Log debug message (only in development)
   * @param {string} message - Log message
   * @param {any} data - Additional data
   */
  debug: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatMessage('debug', message, data));
    }
  }
};

export default logger;