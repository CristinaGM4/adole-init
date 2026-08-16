import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Role } from '../models/api.models';
import { catchError, map, of } from 'rxjs';
export const roleGuard: CanActivateFn = (r) =>
{
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = r.data['roles'] as Role[];
  if (auth.user()) return auth.hasRole(roles) ? true : router.createUrlTree(['/sin-permiso']);
  if (!auth.token) return router.createUrlTree(['/login']);
  return auth.loadMe().pipe(
    map(() => auth.hasRole(roles) ? true : router.createUrlTree(['/sin-permiso'])),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};
