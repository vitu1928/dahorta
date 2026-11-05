import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// Firebase Modules
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { initializeFirestore, provideFirestore, persistentLocalCache, persistentMultipleTabManager } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { environment } from '../environments/environment';

// Abstractions
import { AuthService } from '../domains/auth/data-access/auth.service';
import { ProductsService } from '../domains/customer/data-access/products.service';
import { OrdersService } from '../domains/customer/data-access/orders.service';
import { EmployeeService } from '../domains/employee/data-access/employee.service';
import { AddressService } from '../domains/customer/data-access/address.service';
import { OwnerService } from '../domains/owner/data-access/owner.service';
import { ReviewsService } from '../domains/customer/data-access/reviews.service';

// Firebase Concrete Implementations
import { RestAuthService } from '../domains/auth/data-access/rest-auth.service';
import { FirebaseProductsService } from '../domains/customer/data-access/firebase-products.service';
import { RestOrdersService } from '../domains/customer/data-access/rest-orders.service';
import { RestEmployeeService } from '../domains/employee/data-access/rest-employee.service';
import { LocalAddressService } from '../domains/customer/data-access/local-address.service';
import { FirebaseOwnerService } from '../domains/owner/data-access/firebase-owner.service';
import { FirebaseReviewsService } from '../domains/customer/data-access/firebase-reviews.service';

import { NotificationService } from '../domains/customer/data-access/notification.service';
import { FirebaseNotificationService } from '../domains/customer/data-access/firebase-notification.service';
import { jwtInterceptor } from '../shared/data-access/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    
    // Inicialização do Firebase real
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => {
      const app = getApp();
      return initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    }),
    provideDatabase(() => getDatabase()),

    // Auth, pedidos, estoque e endereços não dependem de autenticação Firebase.
    { provide: AuthService, useClass: RestAuthService },
    { provide: ProductsService, useClass: FirebaseProductsService },
    { provide: OrdersService, useClass: RestOrdersService },
    { provide: EmployeeService, useClass: RestEmployeeService },
    { provide: AddressService, useClass: LocalAddressService },
    { provide: OwnerService, useClass: FirebaseOwnerService },
    { provide: ReviewsService, useClass: FirebaseReviewsService },
    { provide: NotificationService, useClass: FirebaseNotificationService }
  ]
};
