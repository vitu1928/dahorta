import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

import { AuthService } from '../domains/auth/data-access/auth.service';
import { MockAuthService } from '../domains/auth/data-access/mock-auth.service';
import { ProductsService } from '../domains/customer/data-access/products.service';
import { MockProductsService } from '../domains/customer/data-access/mock-products.service';
import { OrdersService } from '../domains/customer/data-access/orders.service';
import { MockOrdersService } from '../domains/customer/data-access/mock-orders.service';
import { EmployeeService } from '../domains/employee/data-access/employee.service';
import { MockEmployeeService } from '../domains/employee/data-access/mock-employee.service';
import { AddressService } from '../domains/customer/data-access/address.service';
import { MockAddressService } from '../domains/customer/data-access/mock-address.service';
import { OwnerService } from '../domains/owner/data-access/owner.service';
import { MockOwnerService } from '../domains/owner/data-access/mock-owner.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    { provide: AuthService, useClass: MockAuthService },
    { provide: ProductsService, useClass: MockProductsService },
    { provide: OrdersService, useClass: MockOrdersService },
    { provide: EmployeeService, useClass: MockEmployeeService },
    { provide: AddressService, useClass: MockAddressService },
    { provide: OwnerService, useClass: MockOwnerService }
  ]
};

