import { Component, Input, OnInit } from '@angular/core';
import { TalentService } from '../../../../../services/talent.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'view-user-performance-report',
  templateUrl: './performance-report.component.html',
  styleUrl: './performance-report.component.scss'
})
export class PerformanceReportComponent  implements OnInit {

  reports: Report[] = [];
  errorMessage: string | null = null;
  allSelected: boolean = false;
  selectedIds: number[] = [];
  userId: any = [];
  path: any ;
  @Input() isPremium: any;

  constructor(private talentService: TalentService, public dialog: MatDialog,private route: ActivatedRoute ) {}

  ngOnInit() {
    
    this.route.params.subscribe((params:any) => {
      this.userId = params.id;
      if(this.isPremium){
        this.loadReports(this.userId);      
      }
    });
  }

  loadReports(id:any) {
    this.talentService.getPerformanceReportsData(id).subscribe(
      response => {
        if (response.status) {
          this.reports = response.data.reports;
        } else {
          this.errorMessage = response.message;
        }
      },
      error => {
        this.errorMessage = 'Error fetching reports: ' + error.message;
      }
    );
  }
  
}
