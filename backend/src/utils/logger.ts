import pino from 'pino';

const logLevel = process.env.LOG_LEVEL || 'info';
const isDev = process.env.NODE_ENV === 'development';

export function createLogger(moduleName: string) {
  if (isDev) {
    return pino({
      level: logLevel,
      transport: {
        target: 'pino/file',
        options: { destination: '/dev/stdout' }
      }
    }).child({ module: moduleName });
  }

  return pino({
    level: logLevel
  }).child({ module: moduleName });
}
