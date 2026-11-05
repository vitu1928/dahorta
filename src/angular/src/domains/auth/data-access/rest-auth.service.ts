import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JwtTokenStore } from '../../../shared/data-access/jwt-token.store';
import { AuthService } from './auth.service';
import { User, UserRole } from './auth.models';

interface TokenResponse {
  accessToken: string;
  usuarioId: number;
  nome: string;
  email: string;
  perfil: 'ADMIN' | 'COZINHA' | 'MOTOBOY' | 'CLIENTE';
}

interface UsuarioResponse {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  perfil: TokenResponse['perfil'];
}

@Injectable({ providedIn: 'root' })
export class RestAuthService extends AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenStore = inject(JwtTokenStore);
  private readonly baseUrl = environment.apiUrl;

  override readonly currentUser = signal<User | null>(null);
  override readonly isAuthenticated = computed(() => this.currentUser() !== null);
  override readonly initialized = this.restoreSession();

  constructor() {
    super();
  }

  override async login(email: string, password: string): Promise<{ success: boolean; message: string; role?: string }> {
    try {
      const response = await firstValueFrom(this.http.post<TokenResponse>(`${this.baseUrl}/auth/login`, {
        email,
        senha: password
      }));
      this.saveSession(response);
      return { success: true, message: 'Login realizado com sucesso!', role: this.currentUser()?.role };
    } catch (error) {
      return { success: false, message: this.errorMessage(error, 'E-mail ou senha inválidos.') };
    }
  }

  override async loginWithGoogle(): Promise<{ success: boolean; message: string; role?: string }> {
    return {
      success: false,
      message: 'Login com Google ainda não está disponível na API.'
    };
  }

  override async logout(): Promise<void> {
    this.tokenStore.clear();
    this.currentUser.set(null);
    await this.router.navigate(['/landing']);
  }

  override async register(
    name: string,
    email: string,
    password: string,
    phone: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await firstValueFrom(this.http.post<TokenResponse>(`${this.baseUrl}/auth/register`, {
        nome: name,
        email,
        senha: password,
        telefone: phone
      }));
      this.saveSession(response);
      return { success: true, message: 'Conta criada com sucesso!' };
    } catch (error) {
      return { success: false, message: this.errorMessage(error, 'Não foi possível criar a conta.') };
    }
  }

  override async updateProfile(name: string, email: string, phone: string): Promise<void> {
    const response = await firstValueFrom(this.http.patch<TokenResponse>(`${this.baseUrl}/usuarios/me`, {
      nome: name,
      email,
      telefone: phone
    }));
    this.saveSession(response);
  }

  override async updatePassword(
    newPassword: string,
    currentPassword?: string
  ): Promise<{ success: boolean; message: string }> {
    if (!currentPassword) {
      return { success: false, message: 'Informe sua senha atual para continuar.' };
    }
    try {
      await firstValueFrom(this.http.patch<void>(`${this.baseUrl}/usuarios/me/senha`, {
        senhaAtual: currentPassword,
        novaSenha: newPassword
      }));
      return { success: true, message: 'Senha atualizada com sucesso!' };
    } catch (error) {
      return { success: false, message: this.errorMessage(error, 'Não foi possível atualizar a senha.') };
    }
  }

  private async restoreSession(): Promise<boolean> {
    if (!this.tokenStore.get()) {
      return true;
    }
    try {
      const profile = await firstValueFrom(this.http.get<UsuarioResponse>(`${this.baseUrl}/usuarios/me`));
      this.currentUser.set(this.toUser(profile));
    } catch {
      this.tokenStore.clear();
      this.currentUser.set(null);
    }
    return true;
  }

  private saveSession(response: TokenResponse): void {
    this.tokenStore.set(response.accessToken);
    this.currentUser.set({
      id: String(response.usuarioId),
      name: response.nome,
      email: response.email,
      password: '',
      avatar: this.avatarFor(response.nome),
      role: this.toRole(response.perfil)
    });
  }

  private toUser(response: UsuarioResponse): User {
    return {
      id: String(response.id),
      name: response.nome,
      email: response.email,
      password: '',
      avatar: this.avatarFor(response.nome),
      phone: response.telefone ?? undefined,
      role: this.toRole(response.perfil)
    };
  }

  private avatarFor(name: string): string {
    return name.split(/\s+/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase();
  }

  private toRole(perfil: TokenResponse['perfil']): UserRole {
    switch (perfil) {
      case 'ADMIN': return 'owner';
      case 'COZINHA': return 'employee';
      case 'MOTOBOY': return 'motoboy';
      case 'CLIENTE': return 'customer';
    }
  }

  private errorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const detail = error.error?.detail ?? error.error?.message;
      if (typeof detail === 'string' && detail.trim()) {
        return detail;
      }
      if (error.status === 0) {
        return 'Não foi possível conectar à API. Verifique se o backend está em execução.';
      }
    }
    return fallback;
  }
}
