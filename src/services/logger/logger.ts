type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogMetadata = Record<string, unknown>;

const levelWeight: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const levelColor: Record<LogLevel, string> = {
  debug: '\x1b[36m',
  info: '\x1b[32m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
};

const resetColor = '\x1b[0m';
const dimColor = '\x1b[2m';

function getConfiguredLevel(): LogLevel {
  const rawLevel = process.env.EXPO_PUBLIC_LOG_LEVEL?.toLowerCase();

  if (rawLevel === 'trace') {
    return 'debug';
  }

  if (rawLevel && rawLevel in levelWeight) {
    return rawLevel as LogLevel;
  }

  return __DEV__ ? 'debug' : 'warn';
}

function shouldLog(level: LogLevel) {
  return levelWeight[level] >= levelWeight[getConfiguredLevel()];
}

function formatMetadata(metadata?: LogMetadata) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return '';
  }

  return ` ${dimColor}${JSON.stringify(metadata)}${resetColor}`;
}

function createLogger(scope: string) {
  const write = (level: LogLevel, message: string, metadata?: LogMetadata) => {
    if (!shouldLog(level)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const label = level.toUpperCase().padEnd(5);
    const line = `${dimColor}${timestamp}${resetColor} ${levelColor[level]}${label}${resetColor} ${dimColor}[${scope}]${resetColor} ${message}${formatMetadata(metadata)}`;

    if (level === 'error') {
      console.error(line);
      return;
    }

    if (level === 'warn') {
      console.warn(line);
      return;
    }

    console.log(line);
  };

  return {
    debug: (message: string, metadata?: LogMetadata) => write('debug', message, metadata),
    error: (message: string, metadata?: LogMetadata) => write('error', message, metadata),
    info: (message: string, metadata?: LogMetadata) => write('info', message, metadata),
    warn: (message: string, metadata?: LogMetadata) => write('warn', message, metadata),
  };
}

export const logger = {
  child: createLogger,
  debug: (message: string, metadata?: LogMetadata) => createLogger('App').debug(message, metadata),
  error: (message: string, metadata?: LogMetadata) => createLogger('App').error(message, metadata),
  info: (message: string, metadata?: LogMetadata) => createLogger('App').info(message, metadata),
  warn: (message: string, metadata?: LogMetadata) => createLogger('App').warn(message, metadata),
};
