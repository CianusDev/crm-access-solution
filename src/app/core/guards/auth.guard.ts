import { AuthService } from '@/core/services/auth/auth.service';
import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const check = () =>
    authService.isLoggedIn() ? true : router.createUrlTree(['/auth/login']);

  if (authService.initialized()) {
    return check();
  }

  return toObservable(authService.initialized).pipe(
    filter((done) => done),
    take(1),
    map(() => check()),
  );
};
