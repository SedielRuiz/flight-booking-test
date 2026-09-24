import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const basicAuthToken = btoa('davivienda:flight_secret');

  let modifiedReq = req.clone({
    url: req.url.startsWith('http')
      ? req.url
      : `${environment.apiUrl}${req.url}`,
    setHeaders: {
      Authorization: `Basic ${basicAuthToken}`,
    },
  });

  return next(modifiedReq);
};
