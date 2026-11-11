import { HttpClient } from '@angular/common/http';
import { Injectable, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/data-access/auth.service';
import { ToastService } from '../../../shared/data-access/toast.service';
import { Address } from './customer.models';
import { AddressService } from './address.service';

interface EnderecoSalvoApi {
  id: number;
  rotulo: string;
  rua: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  cep: string;
}

@Injectable({ providedIn: 'root' })
export class RestAddressService extends AddressService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly baseUrl = `${environment.apiUrl}/enderecos`;
  private readonly storedAddresses = signal<Address[]>([]);
  override readonly addresses = this.storedAddresses.asReadonly();

  constructor() {
    super();
    effect(() => {
      const user = this.authService.currentUser();
      this.storedAddresses.set([]);
      if (user) {
        void this.loadAddresses(user.id);
      }
    });
  }

  override async addAddress(address: Omit<Address, 'id'>): Promise<Address> {
    const saved = await firstValueFrom(this.http.post<EnderecoSalvoApi>(this.baseUrl, this.toApi(address)));
    const mapped = this.fromApi(saved);
    this.storedAddresses.update(addresses => [...addresses, mapped]);
    return mapped;
  }

  override async updateAddress(id: string, address: Omit<Address, 'id'>): Promise<Address> {
    const saved = await firstValueFrom(this.http.put<EnderecoSalvoApi>(
      `${this.baseUrl}/${encodeURIComponent(id)}`, this.toApi(address)
    ));
    const mapped = this.fromApi(saved);
    this.storedAddresses.update(addresses => addresses.map(item => item.id === id ? mapped : item));
    return mapped;
  }

  override async removeAddress(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${encodeURIComponent(id)}`));
    this.storedAddresses.update(addresses => addresses.filter(address => address.id !== id));
  }

  private async loadAddresses(userId: string): Promise<void> {
    let addresses: Address[];
    try {
      const response = await firstValueFrom(this.http.get<EnderecoSalvoApi[]>(this.baseUrl));
      addresses = response.map(item => this.fromApi(item));
    } catch (error) {
      console.error('Não foi possível carregar os endereços salvos da API:', error);
      if (this.authService.currentUser()?.id === userId) {
        this.toastService.error('Não foi possível carregar os endereços salvos.');
      }
      return;
    }

    if (this.authService.currentUser()?.id !== userId) return;
    this.storedAddresses.set(addresses);
    try {
      const migrated = await this.migrateLegacyAddresses(userId, addresses);
      if (this.authService.currentUser()?.id === userId) {
        this.storedAddresses.set(migrated);
      }
    } catch (error) {
      console.error('Não foi possível migrar endereços legados para a API:', error);
      if (this.authService.currentUser()?.id === userId) {
        this.toastService.error('Não foi possível importar todos os endereços antigos.');
      }
    }
  }

  private async migrateLegacyAddresses(userId: string, addresses: Address[]): Promise<Address[]> {
    const key = `dahorta_addresses:${userId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return addresses;

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      throw new Error('Formato inválido para os endereços legados.');
    }

    const migrated = [...addresses];
    for (const candidate of parsed) {
      if (this.authService.currentUser()?.id !== userId) return migrated;
      const legacy = this.validateLegacyAddress(candidate);
      const duplicate = migrated.some(address =>
        address.label === legacy.label &&
        address.street === legacy.street &&
        address.number === legacy.number &&
        address.neighborhood === legacy.neighborhood &&
        address.city === legacy.city &&
        address.zipCode === legacy.zipCode
      );
      if (!duplicate) {
        const saved = await firstValueFrom(this.http.post<EnderecoSalvoApi>(this.baseUrl, this.toApi(legacy)));
        migrated.push(this.fromApi(saved));
      }
    }
    localStorage.removeItem(key);
    return migrated;
  }

  private validateLegacyAddress(value: unknown): Omit<Address, 'id'> {
    if (!value || typeof value !== 'object') {
      throw new Error('Endereço legado inválido.');
    }
    const item = value as Partial<Address>;
    if (![item.label, item.street, item.number, item.neighborhood, item.city, item.zipCode]
      .every(field => typeof field === 'string')) {
      throw new Error('Endereço legado incompleto.');
    }
    return {
      label: item.label!,
      street: item.street!,
      number: item.number!,
      complement: typeof item.complement === 'string' ? item.complement : '',
      neighborhood: item.neighborhood!,
      city: item.city!,
      zipCode: item.zipCode!
    };
  }

  private toApi(address: Omit<Address, 'id'>) {
    return {
      rotulo: address.label,
      rua: address.street,
      numero: address.number,
      complemento: address.complement ?? '',
      bairro: address.neighborhood,
      cidade: address.city,
      cep: address.zipCode
    };
  }

  private fromApi(address: EnderecoSalvoApi): Address {
    return {
      id: String(address.id),
      label: address.rotulo,
      street: address.rua,
      number: address.numero,
      complement: address.complemento ?? '',
      neighborhood: address.bairro,
      city: address.cidade,
      zipCode: address.cep
    };
  }
}
