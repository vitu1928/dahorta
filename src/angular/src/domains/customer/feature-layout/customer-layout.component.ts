import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, Router, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartStateService } from '../data-access/cart.state';
import { AuthService } from '@domain/auth/data-access/auth.service';
import { EmployeeService } from '@domain/employee/data-access/employee.service';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen flex" style="background: var(--background)">
      <!-- Desktop Sidebar -->
      <aside class="hidden md:flex flex-col sticky top-0 h-screen z-50 w-[280px]" style="background: var(--background); border-right: 1px solid var(--border-light); overflow-y: auto;">
        <div class="p-8 flex flex-col h-full">
          <!-- Logo -->
          <div class="flex items-center gap-4 mb-12">
            <div class="w-14 h-14 bg-white rounded-full flex items-center justify-center p-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.15)] border-2 border-primary">
              <img src="/assets/logo.png" alt="DaHorta" class="w-full h-full object-contain rounded-full" />
            </div>
            <span class="text-[22px] font-[800] text-primary" style="font-family: 'Space Grotesk', sans-serif">DaHorta</span>
          </div>

          <!-- Navigation -->
          <nav class="flex-1 space-y-2">
            <a routerLink="/customer/menu" routerLinkActive="active-nav" class="nav-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-muted-foreground font-medium no-underline">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span>Cardápio</span>
            </a>
            @if (isLoggedIn()) {
              <a routerLink="/customer/cart" routerLinkActive="active-nav" class="nav-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-muted-foreground font-medium no-underline">
                <div class="relative flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                  @if (cartCount() > 0) {
                    <span class="absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center text-white bg-primary text-[9px] font-[700]">{{ cartCount() }}</span>
                  }
                </div>
                <span>Carrinho</span>
              </a>
              <a routerLink="/customer/orders" routerLinkActive="active-nav" class="nav-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-muted-foreground font-medium no-underline">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" x2="12" y1="22.08" y2="12"/></svg>
                <span>Meus Pedidos</span>
              </a>
              <a routerLink="/customer/profile" routerLinkActive="active-nav" class="nav-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-muted-foreground font-medium no-underline">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>Meu Perfil</span>
              </a>
            }
          </nav>

          <!-- Auth Actions -->
          @if (isLoggedIn()) {
            <button (click)="logout()" class="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all border-none bg-transparent cursor-pointer font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              <span>Sair da conta</span>
            </button>
          } @else {
            <button (click)="goToLogin()" class="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl transition-all border-none cursor-pointer font-semibold" style="background: var(--primary); color: var(--primary-foreground);">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-in"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
              <span>Fazer Login</span>
            </button>
          }
        </div>
      </aside>

      <div class="flex-1 flex flex-col min-w-0 font-sans">
        <!-- Top Header -->
        <header class="relative overflow-hidden h-[120px]" style="border-bottom: 1px solid var(--border-light)">
          <img src="/assets/hero.png" alt="Hero" class="absolute inset-0 z-0 w-full h-full object-cover opacity-80"
            [style.filter]="!restaurantOpen() ? 'blur(7px)' : 'none'"
            style="transition: filter 0.4s ease;"
          />
          <div class="absolute inset-0 bg-black/40 z-[1]"></div>

          <!-- Wrapper: full width, no right padding when closed -->
          <div
            class="flex items-center h-full mx-auto relative z-10 max-w-[1200px]"
            [class.pr-0]="!restaurantOpen()"
            [class.px-6]="restaurantOpen()"
            style="padding-left: 24px;"
          >
            <!-- Left: logo + name + desc (60% when closed, full when open) -->
            <div
              class="flex items-center gap-3 shrink-0"
              [style.width]="!restaurantOpen() ? '60%' : 'auto'"
            >
              <div class="w-[52px] h-[52px] bg-white rounded-full flex items-center justify-center p-1 shadow-[0_2px_12px_rgba(0,0,0,0.15)] border-2 border-primary">
                <img src="/assets/logo.png" alt="DaHorta" class="w-full h-full object-contain rounded-full" />
              </div>
              <div class="flex flex-col">
                <span class="text-[20px] font-[800] text-white" style="font-family: 'Poppins', sans-serif">DaHorta</span>
                <span class="text-[10px] font-medium text-white/90">Bowls orgânicos, frescos e cheios de vida.</span>
              </div>
            </div>

            <!-- Right: Restaurante Fechado — ocupa 40%, fundo preto até a borda -->
            @if (!restaurantOpen()) {
              <div
                class="hidden md:flex items-center justify-center h-full flex-1"
                style="background: #000000;"
              >
                <span style="font-size: clamp(18px, 2.9vw, 29px); font-weight: 600; letter-spacing: 0.06em; color: #ffffff; font-family: 'Poppins', sans-serif; white-space: nowrap;">
                  RESTAURANTE FECHADO
                </span>
              </div>
            }

            <!-- Mobile: cart + fechado badge -->
            <div class="flex items-center gap-2 ml-auto md:hidden pr-4">
              @if (!restaurantOpen()) {
                <span class="text-white font-bold text-xs" style="background: #000; padding: 3px 8px; border-radius: 6px; letter-spacing: 0.04em;">FECHADO</span>
              }
              <button class="relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all border-none bg-primary text-white font-bold" (click)="router.navigate(['/customer/cart'])">
                🛒 {{ cartCount() }}
              </button>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1 pb-24 md:pb-8">
          <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-[1200px]">
            <router-outlet></router-outlet>
          </div>
        </main>
        
        <!-- Mobile Bottom Nav -->
        <nav class="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background border-t border-border-light">
          <div class="flex items-center justify-around mx-auto px-4 py-2 max-w-[600px]">
             <a routerLink="/customer/menu" routerLinkActive="active-mob" class="flex flex-col items-center p-2 text-muted-foreground no-underline text-[9px] font-medium">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-home mb-1"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
               CARDÁPIO
             </a>
             @if (isLoggedIn()) {
               <a routerLink="/customer/cart" routerLinkActive="active-mob" class="flex flex-col items-center p-2 text-muted-foreground no-underline text-[9px] font-medium relative">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-cart mb-1"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                 @if (cartCount() > 0) {
                   <span class="absolute top-1 right-3 w-4 h-4 rounded-full flex items-center justify-center text-white bg-primary text-[8px] font-bold">{{ cartCount() }}</span>
                 }
                 CARRINHO
               </a>
               <a routerLink="/customer/orders" routerLinkActive="active-mob" class="flex flex-col items-center p-2 text-muted-foreground no-underline text-[9px] font-medium">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package mb-1"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" x2="12" y1="22.08" y2="12"/></svg>
                 PEDIDOS
               </a>
               <a routerLink="/customer/profile" routerLinkActive="active-mob" class="flex flex-col items-center p-2 text-muted-foreground no-underline text-[9px] font-medium">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user mb-1"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                 PERFIL
               </a>
             } @else {
               <a routerLink="/login" class="flex flex-col items-center p-2 text-primary no-underline text-[9px] font-bold">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-in mb-1"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
                 LOGIN
               </a>
             }
          </div>
        </nav>
      </div>
    </div>
  `,
  styles: [`
    .active-nav { background: var(--secondary) !important; color: var(--primary) !important; font-weight: 700 !important; }
    .active-mob { color: var(--primary) !important; font-weight: 700 !important; }
  `]
})
export class CustomerLayoutComponent {
  cartState = inject(CartStateService);
  authService = inject(AuthService);
  employeeService = inject(EmployeeService);
  router = inject(Router);

  cartCount = this.cartState.count;
  isLoggedIn = this.authService.isAuthenticated;
  restaurantOpen = this.employeeService.restaurantOpen;

  logout() {
    this.cartState.clear();
    this.authService.logout();
    this.router.navigate(['/landing']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}

