// src/app/services/domain-slug.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { DomainSlugService } from './domain-slug.service';

@Injectable({
  providedIn: 'root' // ✅ Automatically provided to the app
})
export class DomainSlugGuard implements CanActivate {
  constructor(private domainSlugService: DomainSlugService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requestedSlug = route.url[0]?.path;
    console.info('DomainSlugGuard', requestedSlug)

    const currentDomain = this.domainSlugService['currentDomain'];
    const validSlugs = Object.values(this.domainSlugService['domainSlugMap'][currentDomain] || {});
    console.info('validSlugs', validSlugs)
    if (validSlugs.includes(requestedSlug)) {
      return true; // ✅ Allowed
    }

    // ❌ Invalid slug for current domain — redirect to error page
    this.router.navigate(['/404']);
    return false;
  }
}
