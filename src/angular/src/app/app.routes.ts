import { Routes } from '@angular/router';
import { LandingPageComponent } from '../domains/landing/feature-landing/landing-page.component';

export const routes: Routes = [
  // Redirect root to landing (temporary — will expand as domains are migrated)
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  {
    path: 'landing',
    component: LandingPageComponent,
    title: 'DaHorta | Do campo para o seu prato',
  },
  {
    path: 'menu',
    loadComponent: () => import('../domains/customer/feature-menu/menu-page.component').then(m => m.MenuPageComponent),
    title: 'DaHorta | Menu',
  },
  // Catch-all — redirect unknown paths to landing
  { path: '**', redirectTo: 'landing' },
];
