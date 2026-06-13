import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../domains/auth/data-access/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();
  const allowedRoles = route.data?.['allowedRoles'] as string[];

  if (user && allowedRoles && allowedRoles.includes(user.role)) {
    return true;
  }

  // Redireciona o usuário para sua página padrão com base no perfil logado
  if (user) {
    if (user.role === 'owner') return router.createUrlTree(['/owner']);
    if (user.role === 'employee') return router.createUrlTree(['/employee']);
    if (user.role === 'motoboy') return router.createUrlTree(['/motoboy']);
  }
  
  return router.createUrlTree(['/customer/menu']);
};
