// src/app/services/user-role.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {
  private permissionRole: string | null = null;

  // Set role like: setRole('admin', 'editor')
  setRole(userType: string, permission: string): void {
    if (!userType || !permission) return;
    this.permissionRole = userType;
    localStorage.setItem('userPermissionRole', userType);
  }

  // Get combined role like "admin_editor"
  getRole(): string | null {
    if (!this.permissionRole) {
      this.permissionRole = localStorage.getItem('userPermissionRole');
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
    localStorage.removeItem('userPermissionRole');
  }
}
