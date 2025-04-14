import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImageCropperComponent } from './modules/shared/image-cropper/image-cropper.component';

const routes: Routes = [
  { path: 'image-cropper', component: ImageCropperComponent },
  { path: '', redirectTo: '/image-cropper', pathMatch: 'full' },
  // Add other routes here as needed
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }