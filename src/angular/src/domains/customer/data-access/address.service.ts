import { Injectable, Signal } from '@angular/core';
import { Address } from './customer.models';

@Injectable({ providedIn: 'root' })
export abstract class AddressService {
  abstract readonly addresses: Signal<Address[]>;
  abstract addAddress(address: Omit<Address, 'id'>): Promise<Address>;
  abstract removeAddress(id: string): Promise<void>;
  abstract updateAddress(id: string, address: Omit<Address, 'id'>): Promise<Address>;
}
