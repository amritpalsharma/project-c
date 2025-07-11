import { Component, Input, OnInit } from '@angular/core';
import { TalentService } from '../../../../../services/talent.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

interface Report {
  id: string;
  document_title: string;
  created_at: string;
  file_name: string;
  file_type: string;
  selected?: boolean;  // This will store the selected state of the checkbox
}

@Component({
  selector: 'view-user-performance-report',
  templateUrl: './performance-report.component.html',
  styleUrl: './performance-report.component.scss'
})


export class PerformanceReportComponent  implements OnInit {

  reports: Report[] = [];
  // reports: any = [];
  errorMessage: string | null = null;
  allSelected: boolean = false;
  noTextTabs: boolean = true;
  selectedIds: number[] = [];
  userId: any = [];
  path: any ;
  @Input() isPremium: any;

  constructor(
    private talentService: TalentService,
     public dialog: MatDialog,
     private route: ActivatedRoute,
    private router:Router
   ) {}

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
          this.path = response.data.uploads_path;
          this.reports = response.data.reports;
          console.warn('this.reports',this.reports);
          this.noTextTabs = false;
        } else {
          this.reports = [];
          this.noTextTabs = true;
          this.errorMessage = response.message;
        }
      },
      error => {
        this.noTextTabs = true;
        this.errorMessage = 'Error fetching reports: ' + error.message;
      }
    );
  }

  navigateToPlans() {
    const pathname = window.location.pathname;
    const regex = /^\/view\/(talent|scout|club)\/(\d+)$/;
    const match = pathname.match(regex);
    if (match) {
      const role = match[1];
      if (['talent', 'scout', 'club'].includes(role)) {
        this.router.navigate([`/${role}/plans`]);
      }
    }
  }


    // Download a single report
    async downloadInvoice(id: any, src: any, type: any) {
      try {
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const blob = await response.blob(); // Convert the response to a Blob object
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `SoccerYou_Performance_Report-${id}.${type}`; // Set the filename for download
        document.body.appendChild(anchor);
        anchor.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(anchor);
      } catch (error) {
        console.error('There was an error downloading the file:', error);
      }
    }
  
}
