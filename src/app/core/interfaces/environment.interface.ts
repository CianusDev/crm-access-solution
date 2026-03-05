import { LogLevel } from '../services/logger/logger.interface';

export interface Environment {
  production: boolean;
  apiUrl: string;
  logLevel: LogLevel;
}
