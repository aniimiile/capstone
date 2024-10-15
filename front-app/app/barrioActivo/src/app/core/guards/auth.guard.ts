import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const userEmail = localStorage.getItem('userEmail');
    const userPassword = localStorage.getItem('userPassword');
    const isAuthenticated = userEmail && userPassword; // Verifica si el usuario está autenticado

    if (isAuthenticated) {
      return true; // Permite el acceso a la ruta
    } else {
      // Redirige a la página de login si no está autenticado
      this.router.navigate(['/login']); // Cambia '/login' por la ruta de tu página de login
      return false; // Bloquea el acceso a la ruta
    }
  }
}
