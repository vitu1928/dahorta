import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

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
import { FirebaseAuthService } from '../domains/auth/data-access/firebase-auth.service';
import { FirebaseProductsService } from '../domains/customer/data-access/firebase-products.service';
import { FirebaseOrdersService } from '../domains/customer/data-access/firebase-orders.service';
import { FirebaseEmployeeService } from '../domains/employee/data-access/firebase-employee.service';
import { FirebaseAddressService } from '../domains/customer/data-access/firebase-address.service';
import { FirebaseOwnerService } from '../domains/owner/data-access/firebase-owner.service';
import { FirebaseReviewsService } from '../domains/customer/data-access/firebase-reviews.service';

import { NotificationService } from '../domains/customer/data-access/notification.service';
import { FirebaseNotificationService } from '../domains/customer/data-access/firebase-notification.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    
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

    // Injeções de Dependência das Classes Firebase Reais (Sem fallbacks locais)
    { provide: AuthService, useClass: FirebaseAuthService },
    { provide: ProductsService, useClass: FirebaseProductsService },
    { provide: OrdersService, useClass: FirebaseOrdersService },
    { provide: EmployeeService, useClass: FirebaseEmployeeService },
    { provide: AddressService, useClass: FirebaseAddressService },
    { provide: OwnerService, useClass: FirebaseOwnerService },
    { provide: ReviewsService, useClass: FirebaseReviewsService },
    { provide: NotificationService, useClass: FirebaseNotificationService }
  ]
};
