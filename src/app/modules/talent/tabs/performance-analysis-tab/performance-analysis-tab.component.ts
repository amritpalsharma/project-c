import { Component, Input, OnInit } from '@angular/core';
import { TalentService } from '../../../../services/talent.service';
import { MatDialog } from '@angular/material/dialog';
import { AddPerfomanceReportComponent } from './add-perfomance-report/add-perfomance-report.component';
import { MessagePopupComponent } from '../../message-popup/message-popup.component';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { UnverifiedUserComponent } from '../../../shared/unverified-user/unverified-user.component';
import { Router } from '@angular/router';

interface Report {
  id: string;
  document_title: string;
  created_at: string;
  file_name: string;
  file_type: string;
  selected?: boolean;  // This will store the selected state of the checkbox
}

@Component({
  selector: 'talent-performance-analysis',
  templateUrl: './performance-analysis-tab.component.html',
  styleUrls: ['./performance-analysis-tab.component.scss']
})


export class PerformanceAnalysisTabComponent implements OnInit {
  private plansSubscription: Subscription = new Subscription();

  reports: Report[] = [];
  errorMessage: string | null = null;
  allSelected: boolean = false;
  selectedIds: number[] = [];
  idsToDelete: any = [];
  path: any;
  @Input() isPremium: any;
  deletePerformanceConfirm: string = '';
  selectPerformanceFirst: string = '';
  langSubscription!: Subscription;
  @Input() isUserVerified: any;

  constructor(
    private talentService: TalentService,
    public dialog: MatDialog,
    private translateService: TranslateService,
    public router: Router) { }

  ngOnInit() {
    this.loadReports();
    this.translateMsg();
    this.langSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.translateMsg(); // Reload features when the language changes
    });

  }

  loadReports() {
    this.talentService.getPerformanceReports().subscribe(
      response => {
        if (response.status) {
          this.path = response.data.uploads_path;
          this.reports = response.data.reports.map((report: Report) => ({
            ...report,
            selected: false // Initialize selected state as false
          }));
        } else {
          this.reports = [];
          this.errorMessage = response.message;
        }
      },
      error => {
        this.errorMessage = 'Error fetching reports: ' + error.message;
      }
    );
  }

  toggleSelectAll() {
    this.allSelected = !this.allSelected;
    this.reports.forEach(report => (report.selected = this.allSelected));
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
      anchor.download = `report-${id}.${type}`; // Set the filename for download
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(anchor);
    } catch (error) {
      console.error('There was an error downloading the file:', error);
    }
  }

  // Download selected reports
  // async downloadSelectedReports() {
  //   const selectedReports = this.reports.filter(report => report.selected);
  //   let selectedIds :any = [];

  //   console.log(selectedReports)
  //   if (selectedReports.length > 0) {
  //     // Loop through each selected report and download it
  //     for (const report of selectedReports) {
  //       selectedIds[] = report.id
  //       await this.downloadInvoice(selectedIds);
  //       // await this.downloadInvoice(report.id, this.path+report.file_name ,report.file_type);
  //     }
  //   } else {
  //     console.log('No reports selected for download.');
  //   }
  // }

  // Download selected reports
  downloadSelectedReports() {
    const selectedReports = this.reports.filter(report => report.selected);
    let selectedIds: any[] = []; // Initialize as an array
    if (this.selectedIds.length <= 0) {
      this.dialog.open(MessagePopupComponent, {
        width: '500px',
        data: {
          message: this.selectPerformanceFirst,
          action: 'no-performance-selected'
        }
      })
    }
    if (selectedReports.length > 0) {
      // Collect all selected report IDs
      for (const report of selectedReports) {
        selectedIds.push(report.id);
      }
      // const newWindow = window.open('', '_blank');
      // if (!newWindow) {
      //   return;
      // }
      this.talentService.downloadReports(selectedIds).subscribe(
        response => {
          if (response.status && response.data?.zip_path) {
            // console.log(selectedIds);
            const fileUrl = response.data.zip_path;
            // Open the file in a new tab
            // window.open(response.data.zip_path);
            this.forceDownload(response.data.zip_path, response.data.zip_name ? response.data.zip_name : 'documents.zip');
            if (!fileUrl.startsWith('http')) {
              console.info('Invalid FIle Url');
              // newWindow.document.write('<p>Invalid file URL.</p>');
              return;
            }

            // ✅ Redirect opened tab to the file
            // newWindow.location.href = fileUrl;
          }
        },
        error => {
          this.errorMessage = 'Error fetching reports: ' + error.message;
        }
      );


    } else {
      console.log('No reports selected for download.');
    }
  }

  openAddReport() {
    const dialogRef = this.dialog.open(AddPerfomanceReportComponent, {
      width: '870px',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if (result.uploaded === true && result.message != undefined) {
        this.dialog.open(MessagePopupComponent, {
          width: '500px',
          data: {
            message: result.message,
            action: 'no-performance-selected'
          }
        })
      }
      if (result) {
        this.loadReports(); // Reload reports after a new one is added
      }
    });
  }

  onCheckboxChange(report: any) {
    // const index = this.selectedIds.indexOf(report.id);
    // if (index === -1) {
    //   // this.selectedIds.push(Number(report.id));
    //   if (!this.selectedIds.includes(Number(report.id))) {
    //     this.selectedIds.push(Number(report.id));
    //   }
    // } else {
    //   this.selectedIds.splice(index, 1);
    // }
    const id = Number(report.id); // Ensure consistent type
    const index = this.selectedIds.indexOf(id);

    if (index === -1) {
      this.selectedIds.push(id); // Add if not found
    } else {
      this.selectedIds.splice(index, 1); // Remove if found
    }

    // console.log(this.selectedIds)
    if (this.selectedIds.length === this.reports.length) {
      this.allSelected = true;
      // console.warn('All selected');
    } else {
      this.allSelected = false;
      console.warn('Total Reports ' + this.reports.length + 'and selected is ' + this.selectedIds.length)
    }
  }

  selectAllReports() {
    this.allSelected = !this.allSelected;

    // Toggle selection for all reports
    this.reports.forEach(report => {
      report.selected = this.allSelected;
      if (this.allSelected) {
        if (!this.selectedIds.includes(Number(report.id))) {
          this.selectedIds.push(Number(report.id));
        }
      } else {
        this.selectedIds = [];
      }
    });

    console.log('Selected report IDs:', this.selectedIds);
  }

  deleteReports() {
    if (this.selectedIds.length <= 0) {
      this.dialog.open(MessagePopupComponent, {
        width: '500px',
        data: {
          message: this.selectPerformanceFirst,
          action: 'no-performance-selected'
        }
      })
      return
    }
    let lang_id = localStorage.getItem('lang_id');
    let params: any = { id: this.selectedIds, lang: lang_id };
    const messageDialog = this.dialog.open(MessagePopupComponent, {
      width: '500px',
      position: {
        top: '150px'
      },
      data: {
        message: this.deletePerformanceConfirm,
        action: 'delete-performance-analysis'
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.action == "performance-delete-confirmed") {
          this.talentService.deletePerformanceReport(params).subscribe(
            (response) => {
              if (response.status) {
                this.loadReports();
                this.selectedIds = [];
                this.allSelected = false;
                console.log('Reports deleted successfully.');
              } else {
                console.log('Reports not deleted.');
              }
            },
            (error) => {
              console.error('Error deleting reports:', error);
            }
          );
        }
      }
    });
  }
  // function by amrit to convert time
  formatDateTimeOld(dateString: string): string {
    let lang = localStorage.getItem('lang') || 'en'; // Fallback to English if not set

    // Convert "YYYY-MM-DD HH:MM:SS" format to a valid JavaScript Date object
    const date = new Date(dateString.replace(" ", "T")); // Ensure proper parsing

    // Define correct formatting for each language
    let options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: lang !== 'de', // 24-hour format for German only
    };

    let formattedDate = date.toLocaleString(lang, options);

    // Adjust format for specific languages if necessary
    switch (lang) {
      case 'de': // German (24-hour format + "Uhr")
        formattedDate = formattedDate.replace(',', '') + ' Uhr';
        break;
      case 'en': // English (MM/DD/YYYY)
        formattedDate = date.toLocaleString('en-US', options);
        break;
      case 'it': // Italian (DD/MM/YYYY)
      case 'fr': // French (DD/MM/YYYY)
      case 'es': // Spanish (DD/MM/YYYY)
      case 'pt': // Portuguese (DD/MM/YYYY)
      case 'da': // Danish (DD.MM.YYYY)
      case 'sv': // Swedish (YYYY-MM-DD)
        formattedDate = date.toLocaleString(lang, options);
        break;
      default:
        formattedDate = date.toLocaleString('en-US', options); // Default to US English
    }
    formattedDate = formattedDate.replace(', ', ' ');
    return formattedDate;
  }

  translateMsg() {
    this.translateService.get(['deletePerformanceConfirm', 'selectPerformanceFirst']).subscribe((translations) => {
      this.deletePerformanceConfirm = translations['deletePerformanceConfirm'];
      this.selectPerformanceFirst = translations['selectPerformanceFirst'];
    })
  }

  formatDateTime(dateTime: any) {
    return this.talentService.convertTalentDateTime(dateTime);
  }

  navigatePlans() {
    this.router.navigate(['/talent/plans']);
  }

  showVerificationPopup() {
    const messageDialog = this.dialog.open(UnverifiedUserComponent, {
      width: '500px',
      position: {
        top: '150px'
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.action == "delete-confirmed") {
          // this.deleteUser();
        }
      }
    });
  }



  async forceDownload(src: string, filename: string) {
    try {
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const blob = await response.blob(); // Convert the response to a Blob object
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename; // Use the filename passed to the function
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(anchor);
    } catch (error) {
      console.error('There was an error downloading the file:', error);
    }
  }
}
