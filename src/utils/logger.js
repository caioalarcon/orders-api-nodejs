function timestamp() {
  return new Date().toISOString();
}

function formatPayload(level, message, context = {}) {
  return JSON.stringify({ level, message, timestamp: timestamp(), ...context });
}

module.exports = {
  info(message, context = {}) {
    console.info(formatPayload('info', message, context));
  },
  warn(message, context = {}) {
    console.warn(formatPayload('warn', message, context));
  },
  error(message, context = {}) {
    const payload = { ...context };
    if (context.err instanceof Error) {
      payload.error = { message: context.err.message, stack: context.err.stack };
    }
    console.error(formatPayload('error', message, payload));
  },
};
