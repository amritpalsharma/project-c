import { Component, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { ScoutService } from '../../../../services/scout.service';
import { AddNewTalentComponent } from './add-new-talent/add-new-talent.component';
import { ChangeDetectionStrategy, inject, model,  } from '@angular/core';
export interface DialogData {
  animal: string;
  name: string;
}
@Component({
  selector: 'club-portfolio-tab',
  templateUrl: './portfolio-tab.component.html',
  styleUrl: './portfolio-tab.component.scss'
})
export class PortfolioTabComponent {
  readonly animal = signal('');
  readonly name = model('');

  constructor(private route: ActivatedRoute, private userService: UserService, private scoutService: ScoutService, public dialog: MatDialog, private router: Router) { }
  // openDialog(): void {

  //   const dialogRef = this.dialog.open(AddNewTalentComponent, {
  //     data: {name: this.name(), animal: this.animal()},
  //   });


  //   dialogRef.afterClosed().subscribe(result => {
  //     console.log('The dialog was closed');
  //     if (result !== undefined) {
  //       this.animal.set(result);
  //     }
  //   });
  // }


  addNewTalet() {
    const dialogRef = this.dialog.open(AddNewTalentComponent, {
      data: { 
          name: this.name(), 
          animal: this.animal()
       },
    });


    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      if (result !== undefined) {
        this.animal.set(result);
      }
    });
  }
}
