
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';



const materialComponents =[
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule
]

@NgModule({
  declarations: [],
  imports: [
    materialComponents,
  ],
  exports: [
    materialComponents,
  ]
})
export class MaterialModule { }
