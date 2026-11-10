import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// Abstractions
import { AuthService } from '../domains/auth/data-access/auth.service';
import { ProductsService } from '../domains/customer/data-access/products.service';
import { OrdersService } from '../domains/customer/data-access/orders.service';
import { EmployeeService } from '../domains/employee/data-access/employee.service';
import { AddressService } from '../domains/customer/data-access/address.service';
import { OwnerService } from '../domains/owner/data-access/owner.service';
import { ReviewsService } from '../domains/customer/data-access/reviews.service';

// API and browser implementations
import { RestAuthService } from '../domains/auth/data-access/rest-auth.service';
import { RestProductsService } from '../domains/customer/data-access/rest-products.service';
import { RestOrdersService } from '../domains/customer/data-access/rest-orders.service';
import { RestEmployeeService } from '../domains/employee/data-access/rest-employee.service';
import { LocalAddressService } from '../domains/customer/data-access/local-address.service';
import { RestOwnerService } from '../domains/owner/data-access/rest-owner.service';
import { RestReviewsService } from '../domains/customer/data-access/rest-reviews.service';

import { NotificationService } from '../domains/customer/data-access/notification.service';
import { BrowserNotificationService } from '../domains/customer/data-access/browser-notification.service';
import { jwtInterceptor } from '../shared/data-access/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    
    // Auth, catálogo, pedidos, estoque e avaliações usam a API local.
    { provide: AuthService, useClass: RestAuthService },
    { provide: ProductsService, useClass: RestProductsService },
    { provide: OrdersService, useClass: RestOrdersService },
    { provide: EmployeeService, useClass: RestEmployeeService },
    { provide: AddressService, useClass: LocalAddressService },
    { provide: OwnerService, useClass: RestOwnerService },
    { provide: ReviewsService, useClass: RestReviewsService },
    { provide: NotificationService, useClass: BrowserNotificationService }
  ]
};
