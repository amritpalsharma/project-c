// src/app/services/user-role.service.ts
import { Injectable } from '@angular/core';
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';



@Injectable({
  providedIn: 'root'
})
export class UserRoleService {
  private permissionRole: string | null = null;
  private platformId = inject(PLATFORM_ID);
  // Set role like: setRole('admin', 'editor')
  setRole(userType: string, permission: string): void {
    if (!userType || !permission) return;
    this.permissionRole = userType;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('userPermissionRole', userType);
    }
  }

  // Get combined role like "admin_editor"
  getRole(): string | null {
    if (!this.permissionRole) {
      if (isPlatformBrowser(this.platformId)) {
        // localStorage.setItem('userPermissionRole', userType);
        this.permissionRole = localStorage.getItem('userPermissionRole');
      }
    }
    return this.permissionRole;
  }

  // Use in conditions: is('admin_editor')
  is(role: string): boolean {
    return this.getRole() === role;
  }

  // Clear role (logout etc.)
  clearRole(): void {
    this.permissionRole = null;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('userPermissionRole');
      // localStorage.setItem('userPermissionRole', userType);
    }
  }
}
