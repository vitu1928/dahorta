import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../data-access/auth.service';

@Component({
  selector: 'app-signup',
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
          <div class="flex flex-col items-center justify-center gap-3 mb-6">
            <div 
              style="
                width: 70px; 
                height: 70px; 
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
                font-size: 22px;
                font-weight: 800;
                color: var(--primary);
                letter-spacing: -0.02em;
              "
            >
              DaHorta
            </span>
          </div>

          <!-- Título -->
          <h2 class="text-center mb-1 font-bold text-xl" style="color: var(--text-primary);">
            Crie sua conta
          </h2>
          <p 
            class="text-center mb-6"
            style="color: var(--text-secondary); font-size: 14px;"
          >
            Cadastre-se para começar a pedir bowls saudáveis
          </p>

          <!-- Form -->
          <form (submit)="handleRegister($event)" class="space-y-4">
            <div>
              <label class="block mb-1 text-sm font-medium text-muted-foreground">
                Nome Completo
              </label>
              <input
                type="text"
                [(ngModel)]="name"
                name="name"
                placeholder="Ex: Ana Paula"
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
              <label class="block mb-1 text-sm font-medium text-muted-foreground">
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
              <label class="block mb-1 text-sm font-medium text-muted-foreground">
                Telefone
              </label>
              <input
                type="tel"
                [value]="phone"
                (input)="onPhoneInput($event)"
                name="phone"
                placeholder="(11) 99999-9999"
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
              <label class="block mb-1 text-sm font-medium text-muted-foreground">
                Senha
              </label>
              <input
                type="password"
                [(ngModel)]="password"
                name="password"
                placeholder="Mínimo 6 caracteres"
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
              <label class="block mb-1 text-sm font-medium text-muted-foreground">
                Confirmar Senha
              </label>
              <input
                type="password"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                placeholder="Digite a senha novamente"
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

            @if (error()) {
              <div
                class="flex items-center gap-2 rounded-lg px-4 py-3 animate-fade-in"
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
                margin-top: 8px;
              "
              [style.cursor]="loading() ? 'wait' : 'pointer'"
              [style.background]="loading() ? 'var(--primary-hover)' : 'var(--primary)'"
            >
              @if (loading()) {
                <div
                  class="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"
                ></div>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-plus"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                <span>Criar Conta</span>
              }
            </button>
          </form>

          <!-- Link secundário -->
          <p
            class="text-center mt-6 mb-0"
            style="
              color: var(--text-secondary);
              font-size: 14px;
            "
          >
            Já tem uma conta?
            <a
              routerLink="/login"
              style="
                color: var(--primary);
                text-decoration: none;
                font-weight: 600;
              "
              class="hover:underline"
            >
              Entrar
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
    .submit-btn:hover:not([disabled]) {
      background: var(--primary-hover) !important;
    }
    .input-field:focus {
      border-color: var(--primary) !important;
      box-shadow: 0 0 0 3px var(--ring) !important;
    }
    .animate-fade-in {
      animation: fadeIn 0.2s ease-out forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class SignupComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  
  error = signal('');
  loading = signal(false);

  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // digits only
    if (value.length > 11) {
      value = value.substring(0, 11);
    }
    
    // Formatting: (XX) XXXXX-XXXX
    if (value.length > 6) {
      value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
    } else if (value.length > 2) {
      value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    
    this.phone = value;
    input.value = value;
  }

  isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  async handleRegister(event: Event) {
    event.preventDefault();
    this.error.set('');

    const trimmedName = this.name.trim();
    const trimmedEmail = this.email.trim();
    const trimmedPhone = this.phone.trim();
    const trimmedPassword = this.password.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPhone || !trimmedPassword) {
      this.error.set('Todos os campos são obrigatórios.');
      return;
    }

    if (!this.isValidEmail(trimmedEmail)) {
      this.error.set('Por favor, insira um e-mail válido.');
      return;
    }

    if (trimmedPassword.length < 6) {
      this.error.set('A senha deve conter pelo menos 6 caracteres.');
      return;
    }

    if (trimmedPassword !== this.confirmPassword.trim()) {
      this.error.set('As senhas não coincidem.');
      return;
    }

    this.loading.set(true);
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 1000));

    const result = await this.authService.register(trimmedName, trimmedEmail, trimmedPassword, trimmedPhone);
    this.loading.set(false);

    if (result.success) {
      // MockAuthService logs the user in on successful registration, so we can go directly to customer menu
      this.router.navigate(['/customer/menu']);
    } else {
      this.error.set(result.message);
    }
  }
}