import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

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
    this.loading.set(true);

    // Simulate API delay
    await new Promise((r) => setTimeout(r, 800));

    const result = this.authService.login(this.email, this.password);
    this.loading.set(false);

    if (result.success) {
      if (result.role === 'owner') {
        this.router.navigate(['/owner']);
      } else if (result.role === 'employee') {
        this.router.navigate(['/employee']);
      } else if (result.role === 'motoboy') {
        this.router.navigate(['/motoboy']);
      } else {
        this.router.navigate(['/customer/menu']);
      }
    } else {
      this.error.set(result.message);
    }
  }
}
