import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {

    const expectedRoles: string[] = route.data['roles']; // roles: ['admin']
    // let userRole = localStorage.getItem('userRole'); // Get from auth service in real use
    let userRole = localStorage.getItem('userRole');
    if (userRole == '1') {
      userRole = 'admin';
    } else if (userRole == '2' || userRole == '6') {
      userRole = 'club';
    } else if (userRole == '3' || userRole == '7') {
      userRole = 'scout';
    } else if (userRole == '4') {
      userRole = 'talent';
    }
    console.info('expectedRoles', expectedRoles);
    console.info('userRole', userRole);

    if (!userRole || !expectedRoles.includes(userRole)) {
      this.router.navigate(['/404']); // Redirect to 404 or error page
      return false;
    }

    return true;
  }
}
