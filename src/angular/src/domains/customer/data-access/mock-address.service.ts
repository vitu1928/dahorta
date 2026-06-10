import { Injectable, signal, inject, computed } from '@angular/core';
import { AddressService } from './address.service';
import { Address } from './customer.models';
import { AuthService } from '@domain/auth/data-access/auth.service';

const INITIAL_ADDRESSES: Record<string, Address[]> = {
  'guest': [
    {
      id: 'addr-1',
      label: 'Casa',
      street: 'Rua das Flores',
      number: '123',
      complement: 'Ap 42',
      neighborhood: 'Jardim Florido',
      city: 'São Paulo',
      zipCode: '01234-567',
    }
  ],
  'u1': [
    {
      id: 'addr-2',
      label: 'Trabalho',
      street: 'Av. Paulista',
      number: '1000',
      complement: 'Andar 15',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      zipCode: '01310-100',
    }
  ]
};

@Injectable({ providedIn: 'root' })
export class MockAddressService extends AddressService {
  private authService = inject(AuthService);
  private allAddresses = signal<Record<string, Address[]>>(INITIAL_ADDRESSES);

  override addresses = computed(() => {
    const userId = this.authService.currentUser()?.id || 'guest';
    return this.allAddresses()[userId] || [];
  });

  override addAddress(addr: Omit<Address, 'id'>): Address {
    const userId = this.authService.currentUser()?.id || 'guest';
    const newAddress: Address = {
      ...addr,
      id: `addr-${Date.now()}`
    };
    
    this.allAddresses.update(prev => {
      const userList = prev[userId] || [];
      return {
        ...prev,
        [userId]: [...userList, newAddress]
      };
    });
    
    return newAddress;
  }

  override removeAddress(id: string): void {
    const userId = this.authService.currentUser()?.id || 'guest';
    this.allAddresses.update(prev => {
      const userList = prev[userId] || [];
      return {
        ...prev,
        [userId]: userList.filter(a => a.id !== id)
      };
    });
  }

  override updateAddress(id: string, addr: Omit<Address, 'id'>): void {
    const userId = this.authService.currentUser()?.id || 'guest';
    this.allAddresses.update(prev => {
      const userList = prev[userId] || [];
      return {
        ...prev,
        [userId]: userList.map(a => a.id === id ? { ...addr, id } : a)
      };
    });
  }
}
