import { Injectable, signal, computed } from '@angular/core';
import { AuthService } from './auth.service';
import { User } from './auth.models';
import { MOCK_USERS } from '../../customer/data-access/mock-data';

@Injectable({ providedIn: 'root' })
export class MockAuthService extends AuthService {
  private users = signal<User[]>(MOCK_USERS);
  override currentUser = signal<User | null>(MOCK_USERS[3]); // Default to Ana Paula (customer) for seamless simulation

  override isAuthenticated = computed(() => this.currentUser() !== null);
  override readonly initialized = Promise.resolve(true);

  override async login(email: string, password: string): Promise<{ success: boolean; message: string; role?: string }> {
    const user = this.users().find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (user) {
      this.currentUser.set(user);
      return { success: true, message: 'Login realizado com sucesso!', role: user.role };
    }
    return { success: false, message: 'E-mail ou senha incorretos.' };
  }

  override async loginWithGoogle(): Promise<{ success: boolean; message: string; role?: string }> {
    // Simula o login do Google retornando a cliente demo Ana Paula
    const user = this.users()[3]; // Ana Paula (cliente)
    this.currentUser.set(user);
    return { success: true, message: 'Login com Google (Simulado) realizado com sucesso!', role: user.role };
  }

  override async logout() {
    this.currentUser.set(null);
  }

  override async register(name: string, email: string, password: string, phone: string): Promise<{ success: boolean; message: string }> {
    const existing = this.users().find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, message: 'Este e-mail já está cadastrado.' };
    }
    const newUser: User = {
      id: `u${Date.now()}`,
      name,
      email,
      password,
      role: 'customer',
      phone,
      avatar: name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
    };
    this.users.update((prev) => [...prev, newUser]);
    this.currentUser.set(newUser);
    return { success: true, message: 'Conta criada com sucesso!' };
  }

  override async updateProfile(name: string, email: string, phone: string) {
    const current = this.currentUser();
    if (current) {
      const updated: User = {
        ...current,
        name,
        email,
        phone,
        avatar: name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
      };
      this.currentUser.set(updated);
      this.users.update((prev) => prev.map((u) => u.id === current.id ? updated : u));
    }
  }

  override async updatePassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    return { success: true, message: 'Senha atualizada com sucesso (Simulado)!' };
  }
}
