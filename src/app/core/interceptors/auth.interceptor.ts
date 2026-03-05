import { LocalStorageService } from '@/core/services/local-storage/local-storage.service';
import { TOKEN } from '@/core/constants/local-storage-key';
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const localStorageService = inject(LocalStorageService);
  const token = localStorageService.getState<string>(TOKEN);

  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next(clonedReq);
  }

  return next(req);
};
