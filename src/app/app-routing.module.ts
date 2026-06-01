import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';
import { RoleGuard } from './services/role.guard';
// import { NonAuthGuard } from './services/non.guard';
import { SuccessComponent } from './modules/shared/success/success.component';
import { CancelComponent } from './modules/shared/cancel/cancel.component';
// import { ViewProfileComponent } from './modules/shared/view-profile/view-profile.component';
import { NotFoundComponent } from './modules/website/not-found/not-found.component';
// import { DomainSlugService } from './services/domain-slug.service';

// import { ViewComponent } from './view/view.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./modules/website/website.module').then(
        (m) => m.WebsiteModule
      ),
  },
  // Added by amrit
  // { path: 'home', loadChildren: () => import('./modules/website/website.module').then(m => m.WebsiteModule) },
  // { path: 'about', loadChildren: () => import('./modules/website/website.module').then(m => m.WebsiteModule) },
  // { path: 'contact', loadChildren: () => import('./modules/website/website.module').then(m => m.WebsiteModule) },
  // Added by amrit 
  {
    path: 'admin',
    loadChildren: () =>
      import('./modules/admin/admin.module').then(
        (m) => m.AdminModule
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'talent',
    loadChildren: () =>
      import('./modules/talent/talent.module').then(
        (m) => m.TalentModule
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['talent'] }
  },
  {
    path: 'club',
    loadChildren: () =>
      import('./modules/club/club.module').then(
        (m) => m.ScoutModule
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['club'] }
  },
  {
    path: 'scout',
    loadChildren: () =>
      import('./modules/scout/scout.module').then(
        (m) => m.ScoutModule
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['scout'] }
  },
  {
    path: 'view',
    loadChildren: () =>
      import('./modules/shared/shared.module').then(
        (m) => m.SharedModule
      ),
    canActivate: [AuthGuard]
  },
  { path: 'success', component: SuccessComponent, canActivate: [AuthGuard] },
  { path: 'cancel', component: CancelComponent, canActivate: [AuthGuard] },
  { path: 'talent/success', component: SuccessComponent, canActivate: [AuthGuard] },
  { path: 'talent/cancel', component: CancelComponent, canActivate: [AuthGuard] },
  { path: 'club/success', component: SuccessComponent, canActivate: [AuthGuard] },
  { path: 'club/cancel', component: CancelComponent, canActivate: [AuthGuard] },
  { path: 'scout/success', component: SuccessComponent, canActivate: [AuthGuard] },
  { path: 'scout/cancel', component: CancelComponent, canActivate: [AuthGuard] },
  // Added By Amrit 24-06-2025
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '404' }
  // { path: 'view/:slug/:id', canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    preloadingStrategy: PreloadAllModules

  })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
