import { HttpInterceptorFn } from '@angular/common/http';

// Placeholder for future JWT; reads token from localStorage if present
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};


