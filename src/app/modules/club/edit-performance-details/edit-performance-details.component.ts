import { Component, Inject, SimpleChanges } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TalentService } from '../../../services/talent.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'edit-performance-details',
  templateUrl: './edit-performance-details.component.html',
  styleUrls: ['./edit-performance-details.component.scss']
})
export class EditPerformanceDetailsComponent {
  performance: any = {};
  teams: any[] = [];
  matches : any ;
  goals:any;
  constructor(
    public dialogRef: MatDialogRef<EditPerformanceDetailsComponent>,
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['teams']) {
      // Update the user object with the latest userData
      this.teams = changes['teams'].currentValue;
  
    }
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

      this.talentService.updatePerformance(this.performance.id,myForm.value).subscribe(
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
