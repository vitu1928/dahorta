import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@domain/auth/data-access/auth.service';
import { EmployeeService } from '@domain/employee/data-access/employee.service';

@Component({
  selector: 'app-owner-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="owner owner-layout min-h-screen flex" style="background: var(--background); color: var(--foreground);">
      <!-- ── Sidebar Desktop ── -->
      <aside
        class="hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 flex-shrink-0 text-white"
        style="width: 260px; background: #152415; border-right: 1px solid rgba(255, 255, 255, 0.08);"
      >
        <ng-container *ngTemplateOutlet="sidebarContent"></ng-container>
      </aside>

      <!-- ── Mobile Header ── -->
      <div
        class="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4"
        style="background: #152415; border-bottom: 1px solid rgba(255, 255, 255, 0.08); height: 72px;"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 border border-[#4C7C59]">
            <img src="/assets/logo.png" alt="DaHorta" class="w-full h-full object-contain rounded-full" />
          </div>
          <span class="text-lg font-bold text-white tracking-wide" style="font-family: 'Space Grotesk', sans-serif">DaHorta</span>
        </div>

        <div class="flex items-center gap-4">
          <button
            (click)="toggleMobileMenu()"
            style="color: rgba(255, 255, 255, 0.8); background: none; border: none; cursor: pointer; padding: 4px;"
          >
            <svg *ngIf="!mobileOpen()" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            <svg *ngIf="mobileOpen()" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      <!-- ── Mobile Sidebar Drawer ── -->
      <div *ngIf="mobileOpen()" class="lg:hidden fixed inset-0 z-30 flex">
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black/60 backdrop-blur-xs" (click)="closeMobileMenu()"></div>
        <!-- Drawer Content -->
        <aside
          class="relative flex flex-col h-full w-[260px] max-w-xs z-40 transition-transform duration-300 text-white"
          style="background: #152415; border-right: 1px solid rgba(255, 255, 255, 0.08);"
        >
          <ng-container *ngTemplateOutlet="sidebarContent"></ng-container>
        </aside>
      </div>

      <!-- ── Main Workspace ── -->
      <main class="owner-main flex-1 flex flex-col min-h-screen pt-[72px] lg:pt-0">
        <div class="flex-1 flex flex-col relative">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>

    <!-- ── Sidebar Content Template ── -->
    <ng-template #sidebarContent>
      <div class="flex flex-col h-full">
        <!-- Logo / Title -->
        <div class="flex items-center gap-3 px-6 py-6 border-b border-white/5">
          <div class="w-[52px] h-[52px] bg-white rounded-full flex items-center justify-center p-1.5 shadow border-2 border-[#4C7C59]">
            <img src="/assets/logo.png" alt="DaHorta" class="w-full h-full object-contain rounded-full" />
          </div>
          <div>
            <div class="text-[17px] font-extrabold text-white tracking-wide leading-tight" style="font-family: 'Space Grotesk', sans-serif">DaHorta</div>
            <div class="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-0.5">Painel do Dono</div>
          </div>
        </div>

        <!-- Restaurant Open Status -->
        <div class="px-4 pt-4">
          <button
            (click)="toggleRestaurant()"
            class="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-left border cursor-pointer transition-all hover:bg-white/5 active:scale-[0.98]"
            [style.background]="restaurantOpen() ? 'rgba(58,165,93,0.12)' : 'rgba(230,57,70,0.12)'"
            [style.borderColor]="restaurantOpen() ? 'var(--success)' : 'var(--destructive)'"
          >
            <div
              class="w-2 h-2 rounded-full"
              [class.animate-pulse]="restaurantOpen()"
              [style.background]="restaurantOpen() ? 'var(--success)' : 'var(--destructive)'"
            ></div>
            <span class="text-white text-xs font-bold leading-none">
              {{ restaurantOpen() ? 'Restaurante Aberto' : 'Restaurante Fechado' }}
            </span>
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <p class="text-[9px] text-white/30 font-black tracking-widest uppercase px-3 mb-3">Navegação</p>
          
          <a
            *ngFor="let item of navItems"
            [routerLink]="item.to"
            [routerLinkActiveOptions]="{ exact: item.exact }"
            routerLinkActive="active-link"
            (click)="closeMobileMenu()"
            class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-white/60 hover:text-white hover:bg-white/5 font-semibold text-xs no-underline"
          >
            <!-- Render custom SVG icon directly in template to avoid Angular innerHTML sanitization -->
            <span class="flex-shrink-0 flex items-center">
              <ng-container [ngSwitch]="item.label">
                <!-- Analytics -->
                <svg *ngSwitchCase="'Analytics'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                
                <!-- Cardápio -->
                <svg *ngSwitchCase="'Cardápio'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8Z"/><path d="M14 15.5 9.5 20H4v-5.5l4.5-4.5"/><path d="m18 14 2.3 2.3a3 3 0 0 1 0 4.2l-1.8 1.8a3 3 0 0 1-4.2 0L14 20Z"/><path d="M10 8.5 5.5 4H2v5.5l4.5 4.5"/></svg>
                
                <!-- Cupons -->
                <svg *ngSwitchCase="'Cupons'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l5-5c.94-.94.94-2.48 0-3.42L12 2z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                
                <!-- Estoque -->
                <svg *ngSwitchCase="'Estoque'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                
                <!-- Insumos -->
                <svg *ngSwitchCase="'Insumos'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.55 4.24a1.79 1.79 0 0 0-2.5 1.1l-1.37 6.2a1.79 1.79 0 0 0 1.22 2.1l8.95 2.62a1.79 1.79 0 0 0 2.22-1.25l1.37-6.2a1.79 1.79 0 0 0-1.22-2.1L16.5 9.4z"/><path d="m2 14.5 2.5-2.5M22 9.5l-2.5 2.5"/></svg>
                
                <!-- Fornecedores -->
                <svg *ngSwitchCase="'Fornecedores'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h8"/><path d="M19 16h2a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-3"/><circle cx="7.5" cy="18.5" r="2.5"/><circle cx="16.5" cy="18.5" r="2.5"/></svg>

                <!-- Compras e despesas -->
                <svg *ngSwitchCase="'Financeiro'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/></svg>
                
                <!-- Equipe -->
                <svg *ngSwitchCase="'Equipe'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                
                <!-- Configurações -->
                <svg *ngSwitchCase="'Configurações'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </ng-container>
            </span>
            <span class="flex-1">{{ item.label }}</span>
          </a>
        </nav>

        <!-- User / Logout Footer -->
        <div class="p-4 border-t border-white/5">
          <div class="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <div class="w-9 h-9 rounded-lg bg-white/10 text-[#d4745f] flex items-center justify-center text-sm font-extrabold uppercase shadow-sm">
              {{ userInitials() }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold text-white truncate">{{ currentUserName() }}</div>
              <div class="text-[9px] text-white/40 uppercase font-black tracking-wider mt-0.5">Proprietário</div>
            </div>
            <button
              (click)="logout()"
              class="p-2 rounded-lg text-white/50 hover:text-destructive hover:bg-destructive/10 transition-colors border-none bg-transparent cursor-pointer"
              title="Sair"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            </button>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .owner-layout {
      font-family: 'Poppins', 'Inter', sans-serif;
    }
    .active-link {
      background: var(--sidebar-active) !important;
      color: var(--sidebar-foreground) !important;
      box-shadow: 0 4px 12px rgba(76, 124, 89, 0.3);
    }
    .owner-main {
      margin-left: 0;
    }
    @media (min-width: 1024px) {
      .owner-main {
        margin-left: 260px;
      }
    }
  `]
})
export class OwnerLayoutComponent {
  private authService = inject(AuthService);
  private employeeService = inject(EmployeeService);
  private router = inject(Router);

  mobileOpen = signal(false);

  // Expose restaurant status
  readonly restaurantOpen = this.employeeService.restaurantOpen;

  readonly navItems = [
    {
      to: '/owner',
      exact: true,
      label: 'Analytics',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>'
    },
    {
      to: '/owner/menu',
      exact: false,
      label: 'Cardápio',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'
    },
    {
      to: '/owner/cupons',
      exact: false,
      label: 'Cupons',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'.replace('M12 2v20', '').replace('M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', '') + '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v8M16.5 13.5 21 18M7.5 13.5 3 18M12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M12 14c-4.42 0-8 3.58-8 8v0h16v0c0-4.42-3.58-8-8-8Z"/></svg>'
    },
    {
      to: '/owner/estoque',
      exact: false,
      label: 'Estoque',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>'
    },
    {
      to: '/owner/insumos',
      exact: false,
      label: 'Insumos',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.55 4.24a1.79 1.79 0 0 0-2.5 1.1l-1.37 6.2a1.79 1.79 0 0 0 1.22 2.1l8.95 2.62a1.79 1.79 0 0 0 2.22-1.25l1.37-6.2a1.79 1.79 0 0 0-1.22-2.1L16.5 9.4z"/><path d="m2 14.5 2.5-2.5M22 9.5l-2.5 2.5"/></svg>'
    },
    {
      to: '/owner/fornecedores',
      exact: false,
      label: 'Fornecedores',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="11" x="2" y="7" rx="2"/><path d="M18 18H2v-5c0-1.66 1.34-3 3-3h10c1.66 0 3 1.34 3 3v5zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><circle cx="7" cy="18" r="2"/><circle cx="15" cy="18" r="2"/></svg>'
    },
    {
      to: '/owner/financeiro',
      exact: false,
      label: 'Financeiro',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/></svg>'
    },
    {
      to: '/owner/equipe',
      exact: false,
      label: 'Equipe',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
    },
    {
      to: '/owner/settings',
      exact: false,
      label: 'Configurações',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'
    }
  ];

  // Adjust coupon icon to tag
  constructor() {
    this.navItems[2].icon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l5-5c.94-.94.94-2.48 0-3.42L12 2z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>';
    this.navItems[5].icon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="13" x="3" y="6" rx="2"/><path d="M16 10H8v3h8v-3zM3 10h5M21 10h-5M12 3v3"/></svg>';
  }

  toggleRestaurant(): void {
    this.employeeService.toggleRestaurantOpen();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleMobileMenu(): void {
    this.mobileOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.mobileOpen.set(false);
  }

  currentUserName(): string {
    return this.authService.currentUser()?.name || 'Administrador';
  }

  userInitials(): string {
    const name = this.currentUserName();
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}
