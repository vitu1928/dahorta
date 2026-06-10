import { Injectable, WritableSignal, Signal } from '@angular/core';
import { User } from './auth.models';

@Injectable({ providedIn: 'root' })
export abstract class AuthService {
  abstract readonly currentUser: WritableSignal<User | null>;
  abstract readonly isAuthenticated: Signal<boolean>;

  abstract login(email: string, password: string): { success: boolean; message: string; role?: string };
  abstract logout(): void;
  abstract register(name: string, email: string, password: string, phone: string): { success: boolean; message: string };
  abstract updateProfile(name: string, email: string, phone: string): void;
}
