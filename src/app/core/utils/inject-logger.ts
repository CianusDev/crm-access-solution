import { inject } from '@angular/core';
import { LoggerService } from '@/core/services/logger/logger.service';

export function injectLogger() {
  return inject(LoggerService);
}
