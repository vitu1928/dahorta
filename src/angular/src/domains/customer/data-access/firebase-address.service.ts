import { Injectable, inject, signal, effect } from '@angular/core';
import { AddressService } from './address.service';
import { Address } from './customer.models';
import { Firestore, collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot } from '@angular/fire/firestore';
import { AuthService } from '../../auth/data-access/auth.service';

@Injectable({ providedIn: 'root' })
export class FirebaseAddressService extends AddressService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  private _addresses = signal<Address[]>([]);
  override readonly addresses = this._addresses.asReadonly();
  
  private unsubscribe: (() => void) | null = null;

  constructor() {
    super();
    
    // Listen to current user changes to subscribe/unsubscribe to addresses subcollection
    effect(() => {
      const user = this.authService.currentUser();
      
      // Cleanup previous listener if any
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
      
      if (user) {
        const colRef = collection(this.firestore, `users/${user.id}/addresses`);
        this.unsubscribe = onSnapshot(colRef, (snapshot) => {
          const list: Address[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as Address);
          });
          this._addresses.set(list);
        }, (err) => {
          console.error('Erro ao carregar endereços do usuário:', err);
        });
      } else {
        this._addresses.set([]);
      }
    });
  }

  override addAddress(address: Omit<Address, 'id'>): Address {
    const user = this.authService.currentUser();
    if (!user) {
      throw new Error('Não é possível adicionar endereço: Usuário não autenticado.');
    }

    const colRef = collection(this.firestore, `users/${user.id}/addresses`);
    const docRef = doc(colRef);
    const newAddress: Address = { id: docRef.id, ...address };

    setDoc(docRef, address).catch(err => {
      console.error('Erro ao salvar endereço no Firestore:', err);
    });

    return newAddress;
  }

  override removeAddress(id: string): void {
    const user = this.authService.currentUser();
    if (!user) return;

    const docRef = doc(this.firestore, `users/${user.id}/addresses/${id}`);
    deleteDoc(docRef).catch(err => {
      console.error('Erro ao deletar endereço no Firestore:', err);
    });
  }

  override updateAddress(id: string, address: Omit<Address, 'id'>): void {
    const user = this.authService.currentUser();
    if (!user) return;

    const docRef = doc(this.firestore, `users/${user.id}/addresses/${id}`);
    updateDoc(docRef, { ...address }).catch(err => {
      console.error('Erro ao atualizar endereço no Firestore:', err);
    });
  }
}
