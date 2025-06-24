import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { TalentService } from '../../../../services/talent.service';
import { EditPerformanceDetailsComponent } from '../../edit-performance-details/edit-performance-details.component';
import { MatDialog } from '@angular/material/dialog';
import { AddPerformanceComponent } from './add-performance/add-performance.component';
import { DeletePopupComponent } from '../../delete-popup/delete-popup.component';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { GlobalSettingsService } from '../../../../services/global-settings.service';
import { UnverifiedUserComponent } from '../../../shared/unverified-user/unverified-user.component';

@Component({
  selector: 'talent-performance-tab',
  templateUrl: './performance-tab.component.html',
  styleUrl: './performance-tab.component.scss'
})
export class PerformanceTabComponent {
  isEditing: boolean = false;
  userId: any = 71;
  performances: any = [];
  performancesManual: any = [];
  editableId: string = "";
  pleaseWait: string = "";
  successTxt: string = "";
  teams: any = [];
  flagPath: string = 'https://api.socceryou.ch/uploads/logos/';
  dataTOBeUpdated: any = {
    coach: "",
    team_id: "",
    matches: "",
    goals: "",
    session: "",
    player_age: ""
  }
  loggedInUser: any = localStorage.getItem('userData');
  @Input() isPremium: any;
  @Input() isUserVerified: any;
  currentThemeMode: any = localStorage.getItem('theme') || 'light';
  isLoading: boolean = true;

  // from_date:2021-01-01
  // to_date:2022-01-01
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private talentService: TalentService,
    public dialog: MatDialog,
    private router: Router,
    private translate: TranslateService,
    private globalSettings: GlobalSettingsService
  ) { }

  async ngOnInit() {
    this.route.params.subscribe((params: any) => {
      this.loggedInUser = JSON.parse(this.loggedInUser);
      this.userId = this.loggedInUser.id;
      this.getUserPerformance(this.userId);
    });
    await this.getAllTeams();
    this.getToasterMsg();
    this.translate.onLangChange.subscribe((event) => {
      this.getToasterMsg();
      this.getUserPerformance(this.userId);
      // alert(`Language changed to: ${event.lang}`);
    });
    this.themeChanged();

    this.globalSettings.indexFunctionCall$.subscribe(() => {
      this.themeChanged(); // Call the function when event is received
    });
  }


  openEditDialog(performance: any, isManualEntery: boolean = false) {

    const dialogRef = this.dialog.open(EditPerformanceDetailsComponent, {
      width: '800px',
      data: { performance: performance, teams: this.teams, isManualEntery: isManualEntery }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getUserPerformance(this.userId);
      } else {
        console.log('User canceled the edit');
      }
    });
  }

  // openEditDialogManual(performance: any){

  // }

  openAddDialog() {
    console.log(this.teams)
    const dialogRef = this.dialog.open(AddPerformanceComponent, {
      width: '800px',
      data: {
        performance: {
          "team_id": "",
          "matches": "",
          "goals": "",
          "coach": "",
          "session": "",
          "from_date": "0000-00-00",
          "to_date": "0000-00-00"
        }, teams: this.teams
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getUserPerformance(this.userId);
      } else {
        console.log('User canceled the edit');
      }
    });
  }

  openDeleteDialog(id: any) {
    const dialogRef = this.dialog.open(DeletePopupComponent, {
      width: '600px',
      minWidth: '400px', // Add min-width here
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('openDeleteDialog', id)
      if (result) {
        // If result is true, proceed with deletion logic
        this.deleteUserPerformance(id);
      } else {
        console.log('User canceled the delete');
      }
    });
  }


  openDeleteDialogManual(id: any) {
    const dialogRef = this.dialog.open(DeletePopupComponent, {
      width: '600px',
      minWidth: '400px', // Add min-width here
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('openDeleteDialog', id)
      if (result) {
        // If result is true, proceed with deletion logic
        this.deleteUserPerformanceManual(id);
      } else {
        console.log('User canceled the delete');
      }
    });
  }

  deleteUserPerformanceManual(id: string): void {

    // Call your service to delete the user performance by ID
    this.talentService.deletePerformanceManual(id).subscribe(
      (response: any) => {
        console.log('Performance deleted successfully');
        // Optionally refresh the list or handle success
        this.getUserPerformance(this.userId);
      },
      (error: any) => {
        console.error('Error deleting performance:', error);
      }
    );
  }


  deleteUserPerformance(id: string): void {

    // Call your service to delete the user performance by ID
    this.talentService.deletePerformance(id).subscribe(
      (response: any) => {
        console.log('Performance deleted successfully');
        // Optionally refresh the list or handle success
        this.getUserPerformance(this.userId);
      },
      (error: any) => {
        console.error('Error deleting performance:', error);
      }
    );
  }

  getUserPerformance(userId: any) {
    this.isLoading = true;
    try {
      this.talentService.getPerformanceData().subscribe((response) => {
        if (response && response.status && response.data && response.data.performanceDetail) {
          this.editableId = "";
          // this.performances = response.data.performanceDetail;
          this.performances = response.data.newPerformanceDetail;
          // this.performancesManual = response.data.newPerformanceDetail;
          // this.performancesManual = response.data.performanceDetailManual;

          // console.log(this.performances)
          this.isLoading = false;
        } else {
          this.performances = [];
          this.performancesManual = [];
          this.isLoading = false;
          // console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      // this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }


  getAllTeams() {
    this.talentService.getTeams().subscribe((data) => {
      this.teams = data;
    });
  }

  editPerformance(performanceId: any) {
    console.log(performanceId)
    this.editableId = performanceId;
    let index = this.performances.findIndex((x: any) => x.id == performanceId);
    let currentRow = this.performances[index];

    this.dataTOBeUpdated = {
      coach: currentRow.coach,
      team_id: currentRow.team_id,
      matches: currentRow.matches,
      goals: currentRow.goals,
      session: currentRow.session,
      player_age: currentRow.player_age
    }
  }


  savePerformance(performanceId: any) {

    // let index = this.performances.findIndex((x:any) => x.id == performanceId);
    // let teamInfo = this.getUpdatedTeamInfoToDisplay(this.dataTOBeUpdated.team_id)
    // let updatedIndexData = this.dataTOBeUpdated;
    // updatedIndexData.id = performanceId;
    // this.performances[index] = updatedIndexData;
    // console.log(JSON.stringify(this.performances))
    // this.editableId = "";
    this.userService.updatePerformance(performanceId, this.dataTOBeUpdated).subscribe((response) => {
      // console.log(response)
      // this.editableId = "";
      if (response.status) {
        this.getUserPerformance(this.userId);
      }
    });
  }

  onSelectChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.updateRow('team_id', Number(selectElement.value));
  }

  onInputChange(event: Event, key: string): void {
    let inputElement = event.target as HTMLInputElement;
    this.updateRow(key, inputElement.value);
  }

  updateRow(key: any, value: any) {
    this.dataTOBeUpdated[key] = value;
  }

  calculateDateRange280425(performance_detail: any): string {
    const fromDate = new Date(performance_detail.from_date);
    const toDate = performance_detail.to_date === '0000-00-00'
      ? new Date() // Current date for "Present"
      : new Date(performance_detail.to_date);

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
    let langSlug = localStorage.getItem('lang') + '';
    const fromDateString = fromDate.toLocaleString(langSlug, { month: 'long', year: 'numeric' });
    // fromDate.toLocaleString('en', { month: 'long', year: 'numeric' })
    const toDateString = performance_detail.to_date === '0000-00-00'
      ? 'Present'
      : toDate.toLocaleString(langSlug, { month: 'long', year: 'numeric' });

    let dateRange = `${fromDateString ?? '-'} - ${toDateString ?? '-'}`;

    if (performance_detail.to_date == '0000-00-00' && performance_detail.from_date == '0000-00-00') {
      return '';
    }

    return dateRange;
  }

  calculateDateRange(performance_detail: any): string {
    const fromDate = new Date(performance_detail.from_date);
    const isPresent = performance_detail.to_date === '0000-00-00';
    const toDate = isPresent ? new Date() : new Date(performance_detail.to_date);

    let years = toDate.getFullYear() - fromDate.getFullYear();
    let months = toDate.getMonth() - fromDate.getMonth();

    // Adjust if the month difference is negative
    if (months < 0) {
      years--;
      months += 12;
    }

    let langSlug = localStorage.getItem('lang') + '';

    const fromDateString = fromDate.toLocaleString(langSlug, { month: 'long', year: 'numeric' });
    const toDateString = isPresent
      ? this.getPresentText(langSlug)
      : toDate.toLocaleString(langSlug, { month: 'long', year: 'numeric' });

    let dateRange = `${fromDateString ?? '-'} - ${toDateString ?? '-'}`;

    // If both from and to dates are '0000-00-00', return empty
    if (performance_detail.to_date === '0000-00-00' && performance_detail.from_date === '0000-00-00') {
      return '';
    }

    return dateRange;
  }

  getPresentText(lang: string): string {
    switch (lang) {
      case 'de': // German
        return 'Gegenwart';
      case 'it': // Italian
        return 'Presente';
      case 'fr': // French
        return 'Présent';
      case 'es': // Spanish
        return 'Presente';
      case 'pt': // Portuguese
        return 'Presente';
      case 'da': // Danish
        return 'Nuværende';
      case 'sv': // Swedish
        return 'Nuvarande';
      case 'en': // English
      default:
        return 'Present';
    }
  }

  getToasterMsg() {
    this.translate.get(['success!', 'submittingPerformanceData', 'pleaseWait']).subscribe((res: any) => {
      this.successTxt = res['success!'];
      //  / this.submittingPerformanceData = res['submittingPerformanceData'];
      this.pleaseWait = res['pleaseWait'];
      // this.downloading = res['downloading'];
    });
  }

  themeChanged() {
    let currentTheme = localStorage.getItem('theme');
    this.currentThemeMode = currentTheme;
    if (this.currentThemeMode == null || this.currentThemeMode == undefined) {
      this.currentThemeMode = 'light';
    }
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
}

