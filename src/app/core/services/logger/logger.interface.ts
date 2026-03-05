export interface LogContext {
  [key: string]: unknown;
}

export interface LogEntry {
  message: string;
  data?: LogContext;
}
