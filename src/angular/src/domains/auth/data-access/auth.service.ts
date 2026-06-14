import { Injectable, WritableSignal, Signal } from '@angular/core';
import { User } from './auth.models';

@Injectable({ providedIn: 'root' })
export abstract class AuthService {
  abstract readonly currentUser: WritableSignal<User | null>;
  abstract readonly isAuthenticated: Signal<boolean>;
  abstract readonly initialized: Promise<boolean>;

  abstract login(email: string, password: string): Promise<{ success: boolean; message: string; role?: string }>;
  abstract loginWithGoogle(): Promise<{ success: boolean; message: string; role?: string }>;
  abstract logout(): Promise<void> | void;
  abstract register(name: string, email: string, password: string, phone: string): Promise<{ success: boolean; message: string }>;
  abstract updateProfile(name: string, email: string, phone: string): Promise<void> | void;
  abstract updatePassword(newPassword: string): Promise<{ success: boolean; message: string }>;
}
