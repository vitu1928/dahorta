import { Injectable, signal, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { User, UserRole } from './auth.models';
import { Auth, authState, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile as fireAuthUpdateProfile, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { updatePassword as fireAuthUpdatePassword } from 'firebase/auth';
import { Firestore, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class FirebaseAuthService extends AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  override readonly currentUser = signal<User | null>(null);
  override readonly isAuthenticated = computed(() => this.currentUser() !== null);

  private resolveInit!: (value: boolean) => void;
  override readonly initialized = new Promise<boolean>((resolve) => {
    this.resolveInit = resolve;
  });

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
              role: (data['role'] as UserRole) || 'customer',
              phone: data['phone'],
              avatar: data['avatar']
            } as User);
          } else {
            // Profile not found in Firestore, fallback to basic auth info and CREATE it
            let role: UserRole = 'customer';
            if (firebaseUser.email === 'dono@dahorta.com') role = 'owner';
            else if (firebaseUser.email === 'func@dahorta.com') role = 'employee';
            else if (firebaseUser.email === 'moto@dahorta.com') role = 'motoboy';

            const name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário';
            const email = firebaseUser.email || '';
            const avatar = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

            const newProfile = {
              name,
              email,
              role,
              avatar,
              createdAt: new Date()
            };

            try {
              await setDoc(userDocRef, newProfile);
              console.log('Documento de perfil auto-gerado para o usuário:', firebaseUser.uid);
            } catch (writeErr) {
              console.error('Erro ao auto-gerar perfil do usuário no Firestore:', writeErr);
            }

            this.currentUser.set({
              id: firebaseUser.uid,
              name,
              email,
              password: '',
              role,
              avatar
            } as User);
          }
        } catch (err) {
          console.error('Erro ao buscar perfil do usuário no Firestore:', err);
          let role: UserRole = 'customer';
          if (firebaseUser.email === 'dono@dahorta.com') role = 'owner';
          else if (firebaseUser.email === 'func@dahorta.com') role = 'employee';
          else if (firebaseUser.email === 'moto@dahorta.com') role = 'motoboy';

          this.currentUser.set({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
            email: firebaseUser.email || '',
            password: '',
            role: role
          });
        }
      } else {
        this.currentUser.set(null);
      }
      this.resolveInit(true);
    });
  }

  override async login(email: string, password: string): Promise<{ success: boolean; message: string; role?: string }> {
    let credential;
    try {
      credential = await signInWithEmailAndPassword(this.auth, email, password);
    } catch (authError: any) {
      console.error('Erro de autenticação no login:', authError);
      let message = 'E-mail ou senha incorretos.';
      if (authError.code === 'auth/invalid-credential' || authError.code === 'auth/wrong-password') {
        message = 'E-mail ou senha incorretos.';
      } else if (authError.code === 'auth/user-not-found') {
        message = 'E-mail não cadastrado.';
      } else if (authError.code === 'auth/too-many-requests') {
        message = 'Muitas tentativas malsucedidas. Tente mais tarde.';
      }
      return { success: false, message };
    }

    let role: UserRole = 'customer';
    let name = '';
    let phone = '';
    let avatar = '';

    try {
      const userDocRef = doc(this.firestore, `users/${credential.user.uid}`);
      const userSnap = await getDoc(userDocRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        role = (data['role'] as UserRole) || 'customer';
        name = data['name'] || '';
        phone = data['phone'] || '';
        avatar = data['avatar'] || '';
      } else {
        if (email === 'dono@dahorta.com') role = 'owner';
        else if (email === 'func@dahorta.com') role = 'employee';
        else if (email === 'moto@dahorta.com') role = 'motoboy';

        name = email.split('@')[0];
        avatar = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

        const newProfile = {
          name,
          email,
          role,
          avatar,
          createdAt: new Date()
        };

        try {
          await setDoc(userDocRef, newProfile);
          console.log('Documento de perfil auto-gerado no login para o usuário:', credential.user.uid);
        } catch (writeErr) {
          console.error('Erro ao auto-gerar perfil do usuário no login:', writeErr);
        }
      }
    } catch (dbError) {
      console.error('Erro ao buscar perfil do usuário no Firestore, usando fallback:', dbError);
      if (email === 'dono@dahorta.com') role = 'owner';
      else if (email === 'func@dahorta.com') role = 'employee';
      else if (email === 'moto@dahorta.com') role = 'motoboy';
    }

    // Synchronously set the currentUser signal immediately so that route guards see it as authenticated!
    this.currentUser.set({
      id: credential.user.uid,
      name: name || email.split('@')[0],
      email: credential.user.email || email,
      password: '',
      role,
      phone,
      avatar
    } as User);

    return {
      success: true,
      message: 'Login realizado com sucesso!',
      role
    };
  }

  override async loginWithGoogle(): Promise<{ success: boolean; message: string; role?: string }> {
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.auth, provider);
      const user = credential.user;

      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      const userSnap = await getDoc(userDocRef);

      let role = 'customer';
      let name = user.displayName || 'Cliente';
      let phone = user.phoneNumber || '';
      let avatar = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

      if (!userSnap.exists()) {
        const userData = {
          name,
          email: user.email || '',
          role: 'customer',
          phone,
          avatar,
          createdAt: new Date()
        };
        await setDoc(userDocRef, userData);
      } else {
        const data = userSnap.data();
        role = data['role'] || 'customer';
        name = data['name'] || name;
        phone = data['phone'] || phone;
        avatar = data['avatar'] || avatar;
      }

      this.currentUser.set({
        id: user.uid,
        name,
        email: user.email || '',
        password: '',
        role,
        phone,
        avatar
      } as User);

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

  override async updatePassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    const firebaseUser = this.auth.currentUser;
    if (firebaseUser) {
      try {
        await fireAuthUpdatePassword(firebaseUser, newPassword);
        return { success: true, message: 'Senha atualizada com sucesso!' };
      } catch (err: any) {
        console.error('Erro ao atualizar senha:', err);
        let message = 'Erro ao atualizar a senha.';
        if (err.code === 'auth/requires-recent-login') {
          message = 'Para alterar a senha, você precisa ter feito login recentemente. Faça logout e login novamente.';
        } else if (err.code === 'auth/weak-password') {
          message = 'A senha é muito fraca. Deve ter pelo menos 6 caracteres.';
        }
        return { success: false, message };
      }
    }
    return { success: false, message: 'Nenhum usuário logado.' };
  }
}
