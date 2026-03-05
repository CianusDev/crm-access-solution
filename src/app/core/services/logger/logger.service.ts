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
    // Utiliser la configuration de l'environnement
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
      default:
        return LogLevel.Info;
    }
  }

  debug({ message, data }: LogEntry): void {
    if (this.logLevel <= LogLevel.Debug) {
      console.debug(`[DEBUG]:${message}`, data);
    }
  }

  info({ message, data }: LogEntry): void {
    if (this.logLevel <= LogLevel.Info) {
      console.debug(`[INFO]:${message}`, data);
    }
  }

  warn({ message, data }: LogEntry): void {
    if (this.logLevel <= LogLevel.Warn) {
      console.debug(`[WARN]:${message}`, data);
    }
  }

  error({ message, data }: LogEntry): void {
    if (this.logLevel <= LogLevel.Error) {
      console.debug(`[ERROR]:${message}`, data);
    }
  }
}
