import { Injectable, effect, inject, signal } from '@angular/core';
import { AddressService } from './address.service';
import { Address } from './customer.models';
import { AuthService } from '../../auth/data-access/auth.service';

@Injectable({ providedIn: 'root' })
export class LocalAddressService extends AddressService {
  private readonly authService = inject(AuthService);
  private readonly storedAddresses = signal<Address[]>([]);
  override readonly addresses = this.storedAddresses.asReadonly();

  constructor() {
    super();
    effect(() => {
      const user = this.authService.currentUser();
      this.storedAddresses.set(user ? this.readAddresses(user.id) : []);
    });
  }

  override addAddress(address: Omit<Address, 'id'>): Address {
    const user = this.authService.currentUser();
    if (!user) {
      throw new Error('Não é possível adicionar endereço: Usuário não autenticado.');
    }

    const newAddress: Address = { id: crypto.randomUUID(), ...address };
    const addresses = [...this.storedAddresses(), newAddress];
    this.persistAddresses(user.id, addresses);
    this.storedAddresses.set(addresses);
    return newAddress;
  }

  override removeAddress(id: string): void {
    const user = this.authService.currentUser();
    if (!user) return;

    const addresses = this.storedAddresses().filter(address => address.id !== id);
    this.persistAddresses(user.id, addresses);
    this.storedAddresses.set(addresses);
  }

  override updateAddress(id: string, address: Omit<Address, 'id'>): void {
    const user = this.authService.currentUser();
    if (!user) return;

    const addresses = this.storedAddresses().map(savedAddress =>
      savedAddress.id === id ? { id, ...address } : savedAddress
    );
    this.persistAddresses(user.id, addresses);
    this.storedAddresses.set(addresses);
  }

  private storageKey(userId: string): string {
    return `dahorta_addresses:${userId}`;
  }

  private readAddresses(userId: string): Address[] {
    try {
      const stored = localStorage.getItem(this.storageKey(userId));
      if (!stored) return [];

      const parsed: unknown = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        throw new Error('Formato inválido para endereços salvos.');
      }
      return parsed as Address[];
    } catch (error) {
      console.error('Não foi possível carregar os endereços salvos:', error);
      return [];
    }
  }

  private persistAddresses(userId: string, addresses: Address[]): void {
    try {
      localStorage.setItem(this.storageKey(userId), JSON.stringify(addresses));
    } catch (error) {
      console.error('Não foi possível salvar os endereços neste dispositivo:', error);
      throw error;
    }
  }
}
