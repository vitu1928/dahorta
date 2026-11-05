import { Injectable } from '@angular/core';

const TOKEN_STORAGE_KEY = 'dahorta_access_token';

@Injectable({ providedIn: 'root' })
export class JwtTokenStore {
  get(): string | null {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  set(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
  }

  clear(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }
}
