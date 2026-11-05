import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { JwtTokenStore } from './jwt-token.store';

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(JwtTokenStore).get();
  const apiUrl = environment.apiUrl.replace(/\/+$/, '');

  if (!token || !(request.url === apiUrl || request.url.startsWith(`${apiUrl}/`))) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  }));
};
