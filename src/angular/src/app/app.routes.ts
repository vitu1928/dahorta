import { Routes } from '@angular/router';
import { LandingPageComponent } from '../domains/landing/feature-landing/landing-page.component';
import { authGuard } from '@shared/data-access/auth.guard';
import { roleGuard } from '@shared/data-access/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/landing', pathMatch: 'full' },
  {
    path: 'customer',
    loadComponent: () => import('@domain/customer/feature-layout/customer-layout.component')
      .then(m => m.CustomerLayoutComponent),
    children: [
      { path: 'menu', loadComponent: () => import('@domain/customer/feature-menu/menu.component')
          .then(m => m.MenuComponent) },
      { path: 'cart', loadComponent: () => import('@domain/customer/feature-cart/cart.component')
          .then(m => m.CartComponent) },
      { path: 'checkout', canActivate: [authGuard], loadComponent: () => import('@domain/customer/feature-checkout/checkout.component')
          .then(m => m.CheckoutComponent) },
      { path: 'orders', canActivate: [authGuard], loadComponent: () => import('@domain/customer/feature-orders/orders.component')
          .then(m => m.OrdersComponent) },
      { path: 'orders/:id', canActivate: [authGuard], loadComponent: () => import('@domain/customer/feature-orders/order-tracking.component')
          .then(m => m.OrderTrackingComponent) },
      { path: 'profile', canActivate: [authGuard], loadComponent: () => import('@domain/customer/feature-profile/profile.component')
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
  {
    path: 'register',
    loadComponent: () => import('../domains/auth/feature-signup/signup.component')
      .then(m => m.SignupComponent),
    title: 'DaHorta | Criar Conta',
  },
  {
    path: 'employee',
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['employee', 'owner'] },
    loadComponent: () => import('@domain/employee/feature-dashboard/employee-dashboard.component')
      .then(m => m.EmployeeDashboardComponent),
    title: 'DaHorta | Painel do Funcionário',
  },
  {
    path: 'motoboy',
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['motoboy', 'owner'] },
    loadComponent: () => import('@domain/motoboy/feature-dashboard/motoboy-dashboard.component')
      .then(m => m.MotoboyDashboardComponent),
    title: 'DaHorta | Painel do Motoboy',
  },
  {
    path: 'owner',
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['owner'] },
    loadComponent: () => import('@domain/owner/feature-layout/owner-layout.component')
      .then(m => m.OwnerLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('@domain/owner/feature-analytics/analytics.component')
          .then(m => m.AnalyticsComponent),
        title: 'DaHorta | Analytics'
      },
      {
        path: 'menu',
        loadComponent: () => import('@domain/owner/feature-menu/menu.component')
          .then(m => m.MenuComponent),
        title: 'DaHorta | Cardápio'
      },
      {
        path: 'cupons',
        loadComponent: () => import('@domain/owner/feature-coupons/coupons.component')
          .then(m => m.CouponsComponent),
        title: 'DaHorta | Cupons e Promoções'
      },
      {
        path: 'estoque',
        loadComponent: () => import('@domain/owner/feature-stock/stock.component')
          .then(m => m.StockComponent),
        title: 'DaHorta | Estoque'
      },
      {
        path: 'insumos',
        loadComponent: () => import('@domain/owner/feature-insumos/insumos.component')
          .then(m => m.InsumosComponent),
        title: 'DaHorta | Insumos'
      },
      {
        path: 'fornecedores',
        loadComponent: () => import('@domain/owner/feature-suppliers/suppliers.component')
          .then(m => m.SuppliersComponent),
        title: 'DaHorta | Fornecedores'
      },
      {
        path: 'settings',
        loadComponent: () => import('@domain/owner/feature-settings/settings.component')
          .then(m => m.SettingsComponent),
        title: 'DaHorta | Configurações'
      },
      {
        path: 'equipe',
        loadComponent: () => import('@domain/owner/feature-team/team.component')
          .then(m => m.TeamComponent),
        title: 'DaHorta | Gerenciar Equipe'
      }
    ]
  },
  { path: '**', redirectTo: 'landing' }
];
