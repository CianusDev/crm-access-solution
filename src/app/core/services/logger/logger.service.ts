import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { LogEntry } from './logger.interface';

export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
  None = 4,
}

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private logLevel: LogLevel;

  constructor() {
    this.logLevel = this.getLogLevelFromString(environment.logLevel);
  }

  private getLogLevelFromString(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'debug':
        return LogLevel.Debug;
      case 'info':
        return LogLevel.Info;
      case 'warn':
        return LogLevel.Warn;
      case 'error':
        return LogLevel.Error;
      case 'none':
        return LogLevel.None;
      default:
        return LogLevel.Info;
    }
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}]: ${message}`;
  }

  debug({ message, data }: LogEntry): void {
    if (this.logLevel <= LogLevel.Debug) {
      if (data !== undefined) {
        console.debug(this.formatMessage('DEBUG', message), data);
      } else {
        console.debug(this.formatMessage('DEBUG', message));
      }
    }
  }

  info({ message, data }: LogEntry): void {
    if (this.logLevel <= LogLevel.Info) {
      if (data !== undefined) {
        console.info(this.formatMessage('INFO', message), data);
      } else {
        console.info(this.formatMessage('INFO', message));
      }
    }
  }

  warn({ message, data }: LogEntry): void {
    if (this.logLevel <= LogLevel.Warn) {
      if (data !== undefined) {
        console.warn(this.formatMessage('WARN', message), data);
      } else {
        console.warn(this.formatMessage('WARN', message));
      }
    }
  }

  error({ message, data }: LogEntry): void {
    if (this.logLevel <= LogLevel.Error) {
      if (data !== undefined) {
        console.error(this.formatMessage('ERROR', message), data);
      } else {
        console.error(this.formatMessage('ERROR', message));
      }
    }
  }
}
