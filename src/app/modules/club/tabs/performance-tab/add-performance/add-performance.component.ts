import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { TalentService } from '../../../../../services/talent.service';

@Component({
  selector: 'app-add-performance',
  templateUrl: './add-performance.component.html',
  styleUrl: './add-performance.component.scss'
})

export class AddPerformanceComponent {

  performance: any = {};
  teams: any[] = [];
  matches : any ;
  goals:any;
  constructor(
    public dialogRef: MatDialogRef<AddPerformanceComponent>,
    private talentService: TalentService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.performance = { ...this.data.performance };
    this.teams = { ...this.data.teams };
    this.matches = this.performance.matches;
    this.goals = this.performance.goals;
    console.log('teams:', this.teams);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  loadTeams(): void {
    this.talentService.getTeams().subscribe(
      (response: any) => {
        if (response && response.status) {
          this.teams = response.data.clubs;
        }
      },
      (error: any) => {
        console.error('Error fetching teams:', error);
      }
    );
  }

  onSubmit(myForm: NgForm): void {
    console.log('myForm submitted:', myForm.value);

    if (myForm.valid) {
      // You can prepare myForm data here, but we are directly using the myForm values in this case
      console.log('myForm submitted:', myForm.value);

      this.talentService.addPerformance(myForm.value).subscribe(
        (response: any) => {
          console.log('myForm submitted successfully:', response);
          this.dialogRef.close(response.data);
        },
        (error: any) => {
          console.error('Error submitting the myForm:', error);
        }
      );
    }
  }
}
