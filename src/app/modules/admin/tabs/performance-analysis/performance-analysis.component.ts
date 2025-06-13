import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-performance-analysis',
  templateUrl: './performance-analysis.component.html',
  styleUrl: './performance-analysis.component.scss'
})
export class PerformanceAnalysisComponent {

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private translate: TranslateService
  ) { }

  performancesAnalysis: any = [];
  isLoading: boolean = true;
  userId: any = "";
  path: any;
  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      console.log(params.id)
      this.userId = params.id;
    });
    this.getPerformanceAnalysis(this.userId);
    this.translate.onLangChange.subscribe((event) => {
      this.getPerformanceAnalysis(this.userId);
    });
    // this.getAllTeams();
  }

  getPerformanceAnalysis(userId: any) {


    this.isLoading = true;
    try {
      this.userService.getPerformanceAnalysis(userId).subscribe((response) => {
        if (response && response.status && response.data && response.data.reports) {
          this.performancesAnalysis = response.data.reports;
          this.path = response.data.uploads_path;
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.performancesAnalysis = [];
        }
      });
    } catch (error) {
      this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }


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
      anchor.download = `report-${id}.${type}`; // Set the filename for download
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(anchor);
    } catch (error) {
      console.error('There was an error downloading the file:', error);
    }
  }
}
