import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../../services/user.service';
import { TalentService } from '../../../../../services/talent.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'view-user-performance-details',
  templateUrl: './performance-details.component.html',
  styleUrl: './performance-details.component.scss'
})
export class PerformanceDetailsComponent {

  isEditing: boolean = false;
  userId:any = 71;
  performances:any = [];
  editableId: string = "";
  teams:any = [];
  dataTOBeUpdated:any = {
    coach: "",
    team_id: "",
    matches: "",
    goals: "",
    session: "",
    player_age: ""
  }
  loggedInUser:any = localStorage.getItem('userData');
  @Input() isPremium: any;

  constructor(private route: ActivatedRoute, private userService: UserService,private talentService: TalentService, public dialog: MatDialog) { }
  
  ngOnInit(): void {
    this.route.params.subscribe((params:any) => {
      this.userId = params.id;
      if(this.isPremium){
        this.getUserPerformance(this.userId);
      }
    });
  } 
  
  getUserPerformance(userId:any){
    try {
      this.talentService.getPerformanceList(userId).subscribe((response)=>{
        if (response && response.status && response.data && response.data.performanceDetail) {
          this.editableId = "";
          this.performances = response.data.performanceDetail; 
          // this.isLoading = false;
        } else {
          // this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });     
    } catch (error) {
      // this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

  onSelectChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.updateRow('team_id',Number(selectElement.value));
  }

  onInputChange(event: Event, key:string): void {
    let inputElement = event.target as HTMLInputElement;
    this.updateRow(key,inputElement.value);
  }

  updateRow(key:any, value:any){
    this.dataTOBeUpdated[key] = value;
  }
  
  calculateDateRange(performance_detail: any): string {
    const fromDate = new Date(performance_detail.from_date);
    const toDate = performance_detail.to_date === '0000-00-00'
      ? new Date() // Current date for "Present"
      : new Date(performance_detail.to_date);
  
    // Check if fromDate or toDate is invalid
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return '-'; // Return '-' if either date is invalid
    }
  
    let years = toDate.getFullYear() - fromDate.getFullYear();
    let months = toDate.getMonth() - fromDate.getMonth();
  
    // Adjust if the month difference is negative
    if (months < 0) {
      years--;
      months += 12;
    }
  
    const displayYears = years;
    const displayMonths = months;
  
    // Format the date strings
    const fromDateString = fromDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const toDateString = performance_detail.to_date === '0000-00-00' 
      ? 'Present' 
      : toDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  
    let dateRange = `${fromDateString} - ${toDateString}`;
  
    if (displayYears > 0 || displayMonths > 0) {
      dateRange += ` (${displayYears} yr ${displayMonths} mos)`;
    }
  
    return dateRange;
  }
  
}


