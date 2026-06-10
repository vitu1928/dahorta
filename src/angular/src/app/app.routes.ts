import { Routes } from '@angular/router';
import { LandingPageComponent } from '../domains/landing/feature-landing/landing-page.component';

export const routes: Routes = [
  { path: '', redirectTo: '/customer/menu', pathMatch: 'full' },
  {
    path: 'customer',
    loadComponent: () => import('@domain/customer/feature-layout/customer-layout.component')
      .then(m => m.CustomerLayoutComponent),
    children: [
      { path: 'menu', loadComponent: () => import('@domain/customer/feature-menu/menu.component')
          .then(m => m.MenuComponent) },
      { path: 'cart', loadComponent: () => import('@domain/customer/feature-cart/cart.component')
          .then(m => m.CartComponent) },
      { path: 'checkout', loadComponent: () => import('@domain/customer/feature-checkout/checkout.component')
          .then(m => m.CheckoutComponent) },
      { path: 'orders', loadComponent: () => import('@domain/customer/feature-orders/orders.component')
          .then(m => m.OrdersComponent) },
      { path: 'orders/:id', loadComponent: () => import('@domain/customer/feature-orders/order-tracking.component')
          .then(m => m.OrderTrackingComponent) },
      { path: 'profile', loadComponent: () => import('@domain/customer/feature-profile/profile.component')
          .then(m => m.ProfileComponent) },
    ]
  },
  {
    path: 'landing',
    component: LandingPageComponent,
    title: 'DaHorta | Do campo para o seu prato',
  },
  {
    path: 'login',
    loadComponent: () => import('../domains/auth/feature-login/login.component')
      .then(m => m.LoginComponent),
    title: 'DaHorta | Login',
  },
  { path: '**', redirectTo: 'landing' }
];
