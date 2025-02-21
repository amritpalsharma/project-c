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
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' , data: { title: 'Dashboard' }},
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard],
        data: { title: 'Dashboard' }
      },
      {
        path: 'favorites',
        component: FavoritesComponent,
        data: { title: 'Favorites' }
      },
      {
        path: 'membership',
        component: MembershipComponent,
        data: { title: 'Membership' }
      },
      {
        path: 'explore',
        component: ExploreComponent,
        data: { title: 'Explore' }
      },
      {
        path: 'chat',
        component: ChatComponent,
        data: { title: 'Chat' }
      },
      {
        path: 'plans',
        component: PlanComponent,
        data: { title: 'Plans' }
      },
      {
        path: 'countries',
        component: CountriesComponent,
        data: { title: 'Countries' }
      },
      {
        path: 'setting',
        component: SettingComponent,
        data: { title: 'Settings' }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TalentRoutingModule {}
