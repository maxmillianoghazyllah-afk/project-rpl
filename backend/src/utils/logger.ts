/**
 * Safe Logger Module (Tugas P8: Standar Logging Aman & Masking Data Sensitif)
 * Memastikan tidak ada data kredensial, token otentikasi, atau rahasia pengguna
 * yang bocor ke log server / console.
 */

const SENSITIVE_KEYS = [
  'password',
  'passwordhash',
  'token',
  'jwt',
  'secret',
  'authorization',
  'proofurl',
  'cardnumber',
  'cvv',
];

/**
 * Menyaring objek secara rekursif dan menyamarkan (masking) nilai dari kunci sensitif.
 */
export function maskSensitiveData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    // Deteksi jika string adalah Bearer token
    if (data.toLowerCase().startsWith('bearer ')) {
      return 'Bearer [MASKED_TOKEN]';
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item));
  }

  if (typeof data === 'object') {
    const maskedObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive));

      if (isSensitive) {
        maskedObj[key] = '[PROTECTED_MASKED]';
      } else if (typeof value === 'object' && value !== null) {
        maskedObj[key] = maskSensitiveData(value);
      } else {
        maskedObj[key] = value;
      }
    }
    return maskedObj;
  }

  return data;
}

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SECURITY';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
}

export function formatLogEntry(level: LogLevel, message: string, context?: string, data?: any): string {
  const timestamp = new Date().toISOString();
  const safeData = data !== undefined ? maskSensitiveData(data) : undefined;
  const ctxStr = context ? `[${context}]` : '';

  let logLine = `[${timestamp}] [${level}] ${ctxStr} ${message}`;
  if (safeData !== undefined) {
    logLine += ` | Data: ${JSON.stringify(safeData)}`;
  }
  return logLine;
}

export const logger = {
  info(message: string, context?: string, data?: any) {
    const output = formatLogEntry('INFO', message, context, data);
    console.log(output);
    return output;
  },

  warn(message: string, context?: string, data?: any) {
    const output = formatLogEntry('WARN', message, context, data);
    console.warn(output);
    return output;
  },

  error(message: string, context?: string, data?: any) {
    const output = formatLogEntry('ERROR', message, context, data);
    console.error(output);
    return output;
  },

  security(message: string, context?: string, data?: any) {
    const output = formatLogEntry('SECURITY', message, context, data);
    console.warn(`🔒 ${output}`);
    return output;
  },
};
