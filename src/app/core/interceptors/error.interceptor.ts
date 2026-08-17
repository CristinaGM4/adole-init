import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const a = inject(AuthService);
  return next(req).pipe(
    catchError((e: HttpErrorResponse) => {
      const code = e.error?.error?.code;
      if (e.status === 401 && a.token && !req.url.includes('/public/')) a.logout();
      if (e.status === 403 && code === 'ROLE_DISABLED') a.logout();
      return throwError(() => e);
    }),
  );
};
