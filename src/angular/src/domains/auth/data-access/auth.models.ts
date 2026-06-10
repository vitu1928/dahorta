export type UserRole = 'owner' | 'employee' | 'motoboy' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}
