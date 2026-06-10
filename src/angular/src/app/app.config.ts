import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

import { AuthService } from '../domains/customer/data-access/auth.service';
import { MockAuthService } from '../domains/customer/data-access/mock-auth.service';
import { ProductsService } from '../domains/customer/data-access/products.service';
import { MockProductsService } from '../domains/customer/data-access/mock-products.service';
import { OrdersService } from '../domains/customer/data-access/orders.service';
import { MockOrdersService } from '../domains/customer/data-access/mock-orders.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    { provide: AuthService, useClass: MockAuthService },
    { provide: ProductsService, useClass: MockProductsService },
    { provide: OrdersService, useClass: MockOrdersService }
  ]
};

