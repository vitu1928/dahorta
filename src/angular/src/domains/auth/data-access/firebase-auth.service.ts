import { Injectable, signal, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { User } from './auth.models';
import { Auth, authState, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile as fireAuthUpdateProfile, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class FirebaseAuthService extends AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  override readonly currentUser = signal<User | null>(null);
  override readonly isAuthenticated = computed(() => this.currentUser() !== null);

  constructor() {
    super();
    // Listen to Firebase Auth state changes
    authState(this.auth).subscribe(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(this.firestore, `users/${firebaseUser.uid}`);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            this.currentUser.set({
              id: firebaseUser.uid,
              name: data['name'] || '',
              email: data['email'] || firebaseUser.email || '',
              password: '',
              role: data['role'] || 'customer',
              phone: data['phone'],
              avatar: data['avatar']
            } as User);
          } else {
            // Profile not found in Firestore, fallback to basic auth info
            this.currentUser.set({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
              email: firebaseUser.email || '',
              password: '',
              role: 'customer'
            });
          }
        } catch (err) {
          console.error('Erro ao buscar perfil do usuário no Firestore:', err);
          this.currentUser.set(null);
        }
      } else {
        this.currentUser.set(null);
      }
    });
  }

  override async login(email: string, password: string): Promise<{ success: boolean; message: string; role?: string }> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      const userDocRef = doc(this.firestore, `users/${credential.user.uid}`);
      const userSnap = await getDoc(userDocRef);
      
      let role: any = 'customer';
      if (userSnap.exists()) {
        role = userSnap.data()['role'] || 'customer';
      }

      return {
        success: true,
        message: 'Login realizado com sucesso!',
        role
      };
    } catch (error: any) {
      console.error('Erro no login:', error);
      let message = 'E-mail ou senha incorretos.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        message = 'E-mail ou senha incorretos.';
      } else if (error.code === 'auth/user-not-found') {
        message = 'E-mail não cadastrado.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Muitas tentativas malsucedidas. Tente mais tarde.';
      }
      return { success: false, message };
    }
  }

  override async loginWithGoogle(): Promise<{ success: boolean; message: string; role?: string }> {
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.auth, provider);
      const user = credential.user;

      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      const userSnap = await getDoc(userDocRef);

      let role = 'customer';
      if (!userSnap.exists()) {
        const userData = {
          name: user.displayName || 'Cliente',
          email: user.email || '',
          role: 'customer',
          phone: user.phoneNumber || '',
          avatar: (user.displayName || 'Cliente').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
          createdAt: new Date()
        };
        await setDoc(userDocRef, userData);

        this.currentUser.set({
          id: user.uid,
          password: '',
          ...userData
        } as any);
      } else {
        const data = userSnap.data();
        role = data['role'] || 'customer';
        this.currentUser.set({
          id: user.uid,
          name: data['name'] || '',
          email: data['email'] || user.email || '',
          password: '',
          role,
          phone: data['phone'],
          avatar: data['avatar']
        } as User);
      }

      return {
        success: true,
        message: 'Login com Google realizado com sucesso!',
        role
      };
    } catch (error: any) {
      console.error('Erro no login com Google:', error);
      let message = 'Ocorreu um erro no login com o Google.';
      if (error.code === 'auth/popup-closed-by-user') {
        message = 'O popup de login foi fechado antes de concluir.';
      } else if (error.code === 'auth/blocked-by-popup-killer') {
        message = 'O popup de login foi bloqueado pelo navegador.';
      }
      return { success: false, message };
    }
  }

  override async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigate(['/landing']);
  }

  override async register(name: string, email: string, password: string, phone: string): Promise<{ success: boolean; message: string }> {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      const uid = credential.user.uid;

      // Update basic display name in Firebase Auth
      await fireAuthUpdateProfile(credential.user, { displayName: name });

      // Create profile document in Firestore
      const userDocRef = doc(this.firestore, `users/${uid}`);
      const userData = {
        name,
        email,
        role: 'customer',
        phone,
        avatar: name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
        createdAt: new Date()
      };
      await setDoc(userDocRef, userData);

      // Sync local state immediately
      this.currentUser.set({
        id: uid,
        password: '',
        ...userData
      } as any);

      return { success: true, message: 'Conta criada com sucesso!' };
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      let message = 'Ocorreu um erro ao criar a conta.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'Este e-mail já está cadastrado.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'E-mail inválido.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Senha muito fraca. Deve conter pelo menos 6 caracteres.';
      }
      return { success: false, message };
    }
  }

  override async updateProfile(name: string, email: string, phone: string): Promise<void> {
    const firebaseUser = this.auth.currentUser;
    if (firebaseUser) {
      const userDocRef = doc(this.firestore, `users/${firebaseUser.uid}`);
      const updatedData = {
        name,
        email,
        phone,
        avatar: name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
      };
      
      // Update in Firestore
      await updateDoc(userDocRef, updatedData);
      
      // Update display name in Auth
      await fireAuthUpdateProfile(firebaseUser, { displayName: name });

      // Update local signal state
      const current = this.currentUser();
      if (current) {
        this.currentUser.set({
          ...current,
          ...updatedData
        });
      }
    }
  }
}
