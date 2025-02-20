import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';
import { NonAuthGuard } from './services/non.guard';
import { SuccessComponent } from './modules/shared/success/success.component';
import { CancelComponent } from './modules/shared/cancel/cancel.component';
import { ViewProfileComponent } from './modules/shared/view-profile/view-profile.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./modules/website/website.module').then(
        (m) => m.WebsiteModule
      ), 
    canActivate: [NonAuthGuard]
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./modules/admin/admin.module').then(
        (m) => m.AdminModule
      ),
    canActivate: [AuthGuard]
  },
  {
    path: 'talent',
    loadChildren: () =>
      import('./modules/talent/talent.module').then(
        (m) => m.TalentModule
      ),
    canActivate: [AuthGuard]  // Protect this route with AuthGuard if necessary
  },
  {
    path: 'scout',
    loadChildren: () =>
      import('./modules/scout/scout.module').then(
        (m) => m.ScoutModule
      ),
    canActivate: [AuthGuard]  // Protect this route with AuthGuard if necessary
  },
  {
    path: 'view',
    loadChildren: () =>
      import('./modules/shared/shared.module').then(
        (m) => m.SharedModule
      ),
    canActivate: [AuthGuard]
  },
  { path: 'success', component: SuccessComponent ,canActivate: [AuthGuard]},
  { path: 'cancel', component: CancelComponent ,canActivate: [AuthGuard]},

  {
    path: 'club',
    loadChildren: () =>
      import('./modules/club/club.module').then(
        (m) => m.ScoutModule
      ),
    // canActivate: [AuthGuard]  // Protect this route with AuthGuard if necessary
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
