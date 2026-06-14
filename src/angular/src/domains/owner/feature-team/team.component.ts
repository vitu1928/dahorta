import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../../shared/data-access/toast.service';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'motoboy';
  phone: string;
  avatar?: string;
  createdAt?: any;
}

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 lg:p-8 space-y-6 text-foreground font-sans bg-background">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p class="overline-label mb-2 text-[#E9C46A]" style="font-weight: 700; letter-spacing: 0.1em">Controle de Equipe</p>
          <h1 class="display-heading text-foreground text-3xl font-extrabold" style="font-family: 'Space Grotesk', sans-serif">Funcionários e Motoboys</h1>
          <p class="text-muted-foreground text-xs mt-1">
            Gerencie os acessos de funcionários e motoboys ao sistema.
          </p>
        </div>
        <button
          (click)="openAddModal()"
          class="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border-none cursor-pointer text-white text-xs"
          style="background: var(--primary); box-shadow: 0 4px 12px rgba(76, 124, 89, 0.3);"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Adicionar Membro
        </button>
      </div>

      <!-- Table Card -->
      <div class="rounded-2xl border bg-card text-card-foreground overflow-hidden" style="border-color: var(--border);">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr style="background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border);">
                <th class="p-4 text-xs font-bold text-muted-foreground uppercase">Membro</th>
                <th class="p-4 text-xs font-bold text-muted-foreground uppercase">E-mail</th>
                <th class="p-4 text-xs font-bold text-muted-foreground uppercase">Telefone</th>
                <th class="p-4 text-xs font-bold text-muted-foreground uppercase">Cargo</th>
                <th class="p-4 text-xs font-bold text-muted-foreground uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              @if (loading()) {
                <tr>
                  <td colspan="5" class="p-8 text-center text-muted-foreground text-xs">
                    Carregando membros da equipe...
                  </td>
                </tr>
              } @else if (members().length === 0) {
                <tr>
                  <td colspan="5" class="p-8 text-center text-muted-foreground text-xs">
                    Nenhum funcionário ou motoboy cadastrado.
                  </td>
                </tr>
              } @else {
                @for (m of members(); track m.id) {
                  <tr class="hover:bg-white/2 cursor-default border-bottom transition-colors" style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                    <td class="p-4 flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-white/10 text-primary flex items-center justify-center text-xs font-bold uppercase">
                        {{ m.avatar || getInitials(m.name) }}
                      </div>
                      <span class="text-sm font-semibold text-foreground">{{ m.name }}</span>
                    </td>
                    <td class="p-4 text-sm text-muted-foreground">{{ m.email }}</td>
                    <td class="p-4 text-sm text-muted-foreground">{{ m.phone || 'Sem telefone' }}</td>
                    <td class="p-4">
                      <span
                        class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border"
                        [style.background]="m.role === 'employee' ? 'rgba(233,196,106,0.1)' : 'rgba(45,156,219,0.1)'"
                        [style.borderColor]="m.role === 'employee' ? '#E9C46A' : '#2D9CDB'"
                        [style.color]="m.role === 'employee' ? '#E9C46A' : '#2D9CDB'"
                      >
                        {{ m.role === 'employee' ? 'Funcionário' : 'Motoboy' }}
                      </span>
                    </td>
                    <td class="p-4 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button
                          (click)="openEditModal(m)"
                          class="w-8 h-8 rounded-lg flex items-center justify-center border-none bg-transparent hover:bg-white/5 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                          title="Editar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </button>
                        <button
                          (click)="deleteMember(m)"
                          class="w-8 h-8 rounded-lg flex items-center justify-center border-none bg-transparent hover:bg-destructive/10 cursor-pointer text-muted-foreground hover:text-destructive transition-colors"
                          title="Excluir"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            class="w-full max-w-md rounded-2xl p-6 border bg-card text-foreground shadow-xl space-y-4"
            style="border-color: var(--border);"
          >
            <div>
              <h2 class="text-lg font-bold">{{ isEditing() ? 'Editar Membro da Equipe' : 'Adicionar Membro da Equipe' }}</h2>
              <p class="text-xs text-muted-foreground mt-1">
                {{ isEditing() ? 'Atualize as informações do perfil.' : 'Crie uma conta com acesso de funcionário ou motoboy.' }}
              </p>
            </div>

            @if (formError()) {
              <div class="p-3 rounded-lg text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20">
                {{ formError() }}
              </div>
            }

            <form (submit)="saveMember($event)" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Nome Completo *</label>
                <input
                  type="text"
                  [(ngModel)]="form.name"
                  name="name"
                  required
                  placeholder="Nome do membro"
                  class="w-full px-3 py-2.5 rounded-xl border bg-background text-foreground text-sm outline-none font-sans"
                  style="border-color: var(--border); height: 44px;"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-muted-foreground uppercase mb-1.5">E-mail *</label>
                <input
                  type="email"
                  [(ngModel)]="form.email"
                  name="email"
                  required
                  [disabled]="isEditing()"
                  placeholder="email@dahorta.com"
                  class="w-full px-3 py-2.5 rounded-xl border bg-background text-foreground text-sm outline-none disabled:opacity-50 font-sans"
                  style="border-color: var(--border); height: 44px;"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Telefone</label>
                <input
                  type="text"
                  [(ngModel)]="form.phone"
                  name="phone"
                  placeholder="(11) 99999-9999"
                  class="w-full px-3 py-2.5 rounded-xl border bg-background text-foreground text-sm outline-none font-sans"
                  style="border-color: var(--border); height: 44px;"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Cargo *</label>
                  <select
                    [(ngModel)]="form.role"
                    name="role"
                    required
                    class="w-full px-3 py-2.5 rounded-xl border bg-background text-foreground text-sm outline-none font-sans"
                    style="border-color: var(--border); height: 44px;"
                  >
                    <option value="employee">Funcionário</option>
                    <option value="motoboy">Motoboy</option>
                  </select>
                </div>

                @if (!isEditing()) {
                  <div>
                    <label class="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Senha Inicial *</label>
                    <input
                      type="text"
                      [(ngModel)]="form.password"
                      name="password"
                      required
                      placeholder="Ex: 123456"
                      class="w-full px-3 py-2.5 rounded-xl border bg-background text-foreground text-sm outline-none font-mono"
                      style="border-color: var(--border); height: 44px;"
                    />
                  </div>
                }
              </div>

              <div class="flex gap-3 pt-2">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="flex-1 py-3 rounded-xl font-bold bg-transparent hover:bg-white/5 border border-border text-foreground text-xs cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="submitting()"
                  class="flex-1 py-3 rounded-xl font-bold text-white border-none text-xs cursor-pointer transition-colors"
                  style="background: var(--primary);"
                >
                  {{ submitting() ? 'Salvando...' : 'Salvar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    input:focus, select:focus {
      border-color: var(--primary) !important;
      box-shadow: 0 0 0 2px rgba(76, 124, 89, 0.2);
    }
  `]
})
export class TeamComponent implements OnInit {
  private firestore = inject(Firestore);
  private toast = inject(ToastService);

  readonly members = signal<TeamMember[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);

  readonly showModal = signal(false);
  readonly isEditing = signal(false);
  readonly formError = signal('');

  form = {
    id: '',
    name: '',
    email: '',
    role: 'employee' as 'employee' | 'motoboy',
    phone: '',
    password: '123456'
  };

  ngOnInit() {
    // Listen to users from Firestore
    const colRef = collection(this.firestore, 'users');
    onSnapshot(colRef, (snapshot) => {
      const list: TeamMember[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const role = data['role'];
        if (role === 'employee' || role === 'motoboy') {
          list.push({
            id: doc.id,
            name: data['name'] || '',
            email: data['email'] || '',
            role: role,
            phone: data['phone'] || '',
            avatar: data['avatar'],
            createdAt: data['createdAt']
          });
        }
      });
      // Sort alphabetically by name
      list.sort((a, b) => a.name.localeCompare(b.name));
      this.members.set(list);
      this.loading.set(false);
    }, (err) => {
      console.error('Erro ao carregar equipe:', err);
      this.toast.error('Erro ao ouvir alterações da equipe.');
      this.loading.set(false);
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  openAddModal() {
    this.isEditing.set(false);
    this.formError.set('');
    this.form = {
      id: '',
      name: '',
      email: '',
      role: 'employee',
      phone: '',
      password: '123456'
    };
    this.showModal.set(true);
  }

  openEditModal(m: TeamMember) {
    this.isEditing.set(true);
    this.formError.set('');
    this.form = {
      id: m.id,
      name: m.name,
      email: m.email,
      role: m.role,
      phone: m.phone,
      password: ''
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.formError.set('');
  }

  async registerUserInAuth(email: string, pass: string): Promise<string> {
    let secondaryApp;
    if (getApps().some(app => app.name === 'SecondaryApp')) {
      secondaryApp = getApp('SecondaryApp');
    } else {
      secondaryApp = initializeApp(environment.firebase, 'SecondaryApp');
    }
    const secondaryAuth = getAuth(secondaryApp);
    const credential = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
    const uid = credential.user.uid;
    await signOut(secondaryAuth);
    return uid;
  }

  async saveMember(event: Event) {
    event.preventDefault();
    this.formError.set('');
    this.submitting.set(true);

    try {
      if (this.isEditing()) {
        // Edit flow (updates only profile in Firestore)
        const docRef = doc(this.firestore, `users/${this.form.id}`);
        await updateDoc(docRef, {
          name: this.form.name,
          role: this.form.role,
          phone: this.form.phone,
          avatar: this.getInitials(this.form.name)
        });
        this.toast.success('Perfil atualizado com sucesso!');
        this.closeModal();
      } else {
        // Creation flow (Create account in Auth first, then profile in Firestore)
        if (this.form.password.length < 6) {
          throw new Error('A senha inicial deve conter pelo menos 6 caracteres.');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.form.email.trim())) {
          throw new Error('Insira um e-mail válido.');
        }

        const uid = await this.registerUserInAuth(this.form.email.trim(), this.form.password);

        const docRef = doc(this.firestore, `users/${uid}`);
        await setDoc(docRef, {
          name: this.form.name,
          email: this.form.email.trim().toLowerCase(),
          role: this.form.role,
          phone: this.form.phone,
          avatar: this.getInitials(this.form.name),
          createdAt: new Date()
        });

        this.toast.success('Membro da equipe cadastrado com sucesso!');
        this.closeModal();
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Erro ao salvar membro da equipe.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Este e-mail já está cadastrado em outra conta.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'O e-mail inserido é inválido.';
      }
      this.formError.set(msg);
    } finally {
      this.submitting.set(false);
    }
  }

  async deleteMember(m: TeamMember) {
    if (confirm(`Deseja revogar o acesso de "${m.name}" ao sistema? O perfil dele será excluído.`)) {
      try {
        const docRef = doc(this.firestore, `users/${m.id}`);
        await deleteDoc(docRef);
        this.toast.success('Acesso do membro revogado com sucesso!');
      } catch (err) {
        console.error(err);
        this.toast.error('Erro ao excluir membro da equipe.');
      }
    }
  }
}
