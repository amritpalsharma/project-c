import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from '../../services/auth.guard';
import { MembershipComponent } from './membership/membership.component';
import { PlanComponent } from './plan/plan.component';
import { FavoritesComponent } from '../shared/favorites/favorites.component';
import { ExploreComponent } from '../shared/explore/explore.component';
import { ChatComponent } from '../shared/chat/chat.component';
import { CountriesComponent } from '../shared/countries/countries.component';
import { SettingComponent } from '../shared/setting/setting.component';

const routes: Routes = [
  {
    path: '',
    component: IndexComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
      { path: 'favorites', component: FavoritesComponent},
      { path: 'membership', component: MembershipComponent},
      { path: 'explore', component: ExploreComponent},
      { path: 'chat', component: ChatComponent},
      { path: 'plans', component: PlanComponent},
      { path: 'countries', component: CountriesComponent},
      { path: 'setting', component: SettingComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScoutRoutingModule {}
