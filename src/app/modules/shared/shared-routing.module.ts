import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewProfileComponent } from './view-profile/view-profile.component';
import { IndexComponent } from './index/index.component';

const routes: Routes = [
   {
     path: '',
     component: IndexComponent,
     children: [
       { path: 'player/:id', component: ViewProfileComponent},
       { path: 'scout/:id', component: ViewProfileComponent },
       { path: 'club/:id', component: ViewProfileComponent },
     ]
   }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SharedRoutingModule { }
