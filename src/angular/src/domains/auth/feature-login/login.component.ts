import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../data-access/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div 
      class="min-h-screen flex items-center justify-center px-6 py-12"
      style="background: var(--background-soft);"
    >
      <div 
        class="w-full transition-all duration-300"
        style="max-width: 420px;"
      >
        <!-- Card -->
        <div
          class="rounded-xl p-8"
          style="background: var(--background); box-shadow: var(--shadow-default);"
        >
          <!-- Logo -->
          <div class="flex flex-col items-center justify-center gap-3 mb-8">
            <div 
              style="
                width: 80px; 
                height: 80px; 
                borderRadius: 50%; 
                background: white; 
                padding: 10px; 
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid var(--border-light);
              "
            >
              <img src="/assets/logo.png" alt="DaHorta" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%;" />
            </div>
            <span
              style="
                font-family: 'Poppins', sans-serif;
                font-size: 24px;
                font-weight: 800;
                color: var(--primary);
                letter-spacing: -0.02em;
              "
            >
              DaHorta
            </span>
          </div>

          <!-- Título -->
          <h2 class="text-center mb-2 font-bold text-xl" style="color: var(--text-primary);">
            Bem-vindo de volta
          </h2>
          <p 
            class="text-center mb-8"
            style="color: var(--text-secondary); font-size: 14px;"
          >
            Faça login para acessar o sistema
          </p>

          <!-- Contas Demo -->
          <div
            class="rounded-lg p-4 mb-6"
            style="
              background: var(--secondary);
              border: 1px solid var(--border-light);
            "
          >
            <p
              class="mb-3"
              style="
                color: var(--muted-foreground);
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              "
            >
              Contas demo — senha: 123456
            </p>
            <div class="grid grid-cols-2 gap-2">
              @for (acc of demoAccounts; track acc.email) {
                <button
                  (click)="selectDemo(acc.email)"
                  class="text-left rounded-lg px-3 py-2 transition-all demo-btn"
                  style="
                    background: var(--background);
                    border: 1px solid var(--border);
                    cursor: pointer;
                  "
                >
                  <div
                    style="
                      color: var(--primary);
                      font-size: 12px;
                      font-weight: 600;
                      margin-bottom: 2px;
                    "
                  >
                    {{ acc.label }}
                  </div>
                  <div
                    style="
                      color: var(--muted-foreground);
                      font-size: 10px;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    "
                  >
                    {{ acc.email }}
                  </div>
                </button>
              }
            </div>
          </div>

          <!-- Form -->
          <form (submit)="handleLogin($event)" class="space-y-4">
            <div>
              <label class="block mb-2 text-sm font-medium text-muted-foreground">
                E-mail
              </label>
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                placeholder="seu@email.com"
                required
                class="w-full px-4 outline-none transition-all input-field"
                style="
                  height: 48px;
                  border-radius: var(--radius-input);
                  background: var(--input-background);
                  border: 1px solid var(--border);
                  color: var(--text-primary);
                  font-size: 14px;
                "
              />
            </div>

            <div>
              <label class="block mb-2 text-sm font-medium text-muted-foreground">
                Senha
              </label>
              <div class="relative">
                <input
                  [type]="showPass() ? 'text' : 'password'"
                  [(ngModel)]="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  class="w-full px-4 pr-12 outline-none transition-all input-field"
                  style="
                    height: 48px;
                    border-radius: var(--radius-input);
                    background: var(--input-background);
                    border: 1px solid var(--border);
                    color: var(--text-primary);
                    font-size: 14px;
                  "
                />
                <button
                  type="button"
                  (click)="showPass.set(!showPass())"
                  class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center p-0"
                  style="
                    color: var(--muted-foreground);
                    background: none;
                    border: none;
                    cursor: pointer;
                  "
                >
                  @if (showPass()) {
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <div class="flex justify-end">
              <a
                routerLink="/forgot-password"
                style="
                  color: var(--primary);
                  font-size: 13px;
                  text-decoration: none;
                "
                class="hover:underline"
              >
                Esqueceu a senha?
              </a>
            </div>

            @if (error()) {
              <div
                class="flex items-center gap-2 rounded-lg px-4 py-3"
                style="
                  background: rgba(230,57,70,0.1);
                  border: 1px solid var(--destructive);
                "
              >
                <span style="color: var(--destructive); font-size: 13px;">
                  {{ error() }}
                </span>
              </div>
            }

            <!-- Button Primary -->
            <button
              type="submit"
              [disabled]="loading()"
              class="w-full flex items-center justify-center gap-2 transition-all submit-btn"
              style="
                height: 48px;
                border-radius: var(--radius-input);
                background: var(--primary);
                color: var(--primary-foreground);
                border: none;
                cursor: pointer;
                font-size: 15px;
                font-weight: 600;
              "
              [style.cursor]="loading() ? 'wait' : 'pointer'"
              [style.background]="loading() ? 'var(--primary-hover)' : 'var(--primary)'"
            >
              @if (loading()) {
                <div
                  class="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"
                ></div>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-in"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
                <span>Entrar</span>
              }
            </button>
            
            <!-- Divider -->
            <div class="flex items-center justify-center gap-3 my-4">
              <span class="h-[1px] flex-1" style="background: var(--border); height: 1px; flex: 1;"></span>
              <span class="text-[10px] text-muted-foreground uppercase font-bold tracking-wider" style="color: var(--muted-foreground); font-size: 10px; font-weight: 700;">ou</span>
              <span class="h-[1px] flex-1" style="background: var(--border); height: 1px; flex: 1;"></span>
            </div>

            <!-- Google Sign-in Button -->
            <button
              type="button"
              (click)="handleGoogleLogin()"
              [disabled]="loading()"
              class="w-full flex items-center justify-center gap-3 transition-all google-btn"
              style="
                height: 48px;
                border-radius: var(--radius-input);
                background: white;
                color: #374151;
                border: 1px solid #d1d5db;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
              "
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" preserveAspectRatio="xMidYMid meet">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Entrar com o Google</span>
            </button>
          </form>

          <!-- Link secundário -->
          <p
            class="text-center mt-6"
            style="
              color: var(--text-secondary);
              font-size: 14px;
            "
          >
            Não tem uma conta?
            <a
              routerLink="/register"
              style="
                color: var(--primary);
                text-decoration: none;
                font-weight: 600;
              "
              class="hover:underline"
            >
              Criar conta
            </a>
          </p>
        </div>

        <!-- Footer -->
        <div class="text-center mt-6">
          <p
            style="
              color: var(--muted-foreground);
              font-size: 12px;
            "
          >
            DaHorta &copy; 2026
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .demo-btn:hover {
      border-color: var(--primary) !important;
    }
    .submit-btn:hover:not([disabled]) {
      background: var(--primary-hover) !important;
    }
    .input-field:focus {
      border-color: var(--primary) !important;
      box-shadow: 0 0 0 3px var(--ring) !important;
    }
    .google-btn:hover:not([disabled]) {
      background: #f9fafb !important;
      border-color: #d1d5db !important;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  showPass = signal(false);
  error = signal('');
  loading = signal(false);

  demoAccounts = [
    { label: 'Dono', email: 'dono@dahorta.com' },
    { label: 'Funcionário', email: 'func@dahorta.com' },
    { label: 'Motoboy', email: 'moto@dahorta.com' },
    { label: 'Cliente', email: 'cliente@email.com' },
  ];

  selectDemo(email: string) {
    this.email = email;
    this.password = '123456';
  }

  async handleLogin(event: Event) {
    event.preventDefault();
    this.error.set('');

    const trimmedEmail = this.email.trim();
    if (!trimmedEmail) {
      this.error.set('Por favor, insira o e-mail.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      this.error.set('Por favor, insira um e-mail válido.');
      return;
    }

    this.loading.set(true);

    // Simulate API delay
    await new Promise((r) => setTimeout(r, 800));

    const result = await this.authService.login(trimmedEmail, this.password);
    this.loading.set(false);

    if (result.success) {
      if (result.role === 'owner') {
        this.router.navigate(['/owner']);
      } else if (result.role === 'employee') {
        this.router.navigate(['/employee']);
      } else if (result.role === 'motoboy') {
        this.router.navigate(['/motoboy']);
      } else {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        this.router.navigateByUrl(returnUrl || '/customer/menu');
      }
    } else {
      this.error.set(result.message);
    }
  }

  async handleGoogleLogin() {
    this.error.set('');
    this.loading.set(true);

    const result = await this.authService.loginWithGoogle();
    this.loading.set(false);

    if (result.success) {
      if (result.role === 'owner') {
        this.router.navigate(['/owner']);
      } else if (result.role === 'employee') {
        this.router.navigate(['/employee']);
      } else if (result.role === 'motoboy') {
        this.router.navigate(['/motoboy']);
      } else {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        this.router.navigateByUrl(returnUrl || '/customer/menu');
      }
    } else {
      this.error.set(result.message);
    }
  }
}
