import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../../services/user.service';
import { TalentService } from '../../../../../services/talent.service';
import { MatDialog } from '@angular/material/dialog';
import { WebPages } from '../../../../../services/webpages.service';
import { GlobalSettingsService } from '../../../../../services/global-settings.service';

@Component({
  selector: 'view-user-performance-details',
  templateUrl: './performance-details.component.html',
  styleUrl: './performance-details.component.scss'
})
export class PerformanceDetailsComponent {
  flagPath: string = 'https://api.socceryou.ch/uploads/logos/';
  currentThemeMode: any = localStorage.getItem('theme') || 'light';
  isEditing: boolean = false;
  userId: any = 71;
  performances: any = [];
  performancesManual: any = [];
  editableId: string = "";
  teams: any = [];
  dataTOBeUpdated: any = {
    coach: "",
    team_id: "",
    matches: "",
    goals: "",
    session: "",
    player_age: ""
  }
  loggedInUser: any = localStorage.getItem('userData');
  isLoading: boolean = true;
  @Input() isPremium: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private talentService: TalentService,
    public dialog: MatDialog,
    public webPages: WebPages,
    public globalSettings: GlobalSettingsService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      this.userId = params.id;
      if (this.isPremium) {
        this.getUserPerformance(this.userId);
      }
    });

    this.webPages.languageId$.subscribe((data: any) => {
      if (this.isPremium) {
        this.getUserPerformance(this.userId);
      }
    });

    this.themeChanged();

    this.globalSettings.indexFunctionCall$.subscribe(() => {
      this.themeChanged(); // Call the function when event is received
    });

  }

  getUserPerformance(userId: any) {
    this.isLoading = true;
    try {
      this.talentService.getPerformancesList(userId).subscribe((response) => {
        if (response && response.status && response.data && response.data.performanceDetail) {
          this.editableId = "";
          this.performances = response.data.newPerformanceDetail;
          // this.performances = response.data.performanceDetail;
          // this.performancesManual = response.data.performanceDetailManual;
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.performancesManual = [];
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      this.isLoading = false;
      console.error('Error fetching users:', error);
    }
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

  calculateDateRangeOld(performance_detail: any): string {
    const fromDate = new Date(performance_detail.from_date);
    const toDate = performance_detail.to_date === '0000-00-00'
      ? new Date() // Current date for "Present"
      : new Date(performance_detail.to_date);

    // Check if fromDate or toDate is invalid
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return ''; // Return '-' if either date is invalid
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
    let langSlug = localStorage.getItem('lang') + '';
    const fromDateString = fromDate.toLocaleString(langSlug, { month: 'long', year: 'numeric' });
    const toDateString = performance_detail.to_date === '0000-00-00'
      ? 'Present'
      : toDate.toLocaleString(langSlug, { month: 'long', year: 'numeric' });

    let dateRange = `${fromDateString} - ${toDateString}`;

    if (displayYears > 0 || displayMonths > 0) {
      dateRange += ` (${displayYears} yr ${displayMonths} mos)`;
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

  getPresentText(lang: string): string {
    switch (lang) {
      case 'de': // German
        return 'bis heute';
      case 'it': // Italian
        return 'fino ad oggi';
      case 'fr': // French
        return "jusqu'à aujourd'hui";
      case 'es': // Spanish
        return 'hasta hoy';
      case 'pt': // Portuguese
        return 'até hoje';
      case 'da': // Danish
        return 'indtil i dag';
      case 'sv': // Swedish
        return 'fram till idag';
      case 'en': // English
      default:
        return 'until today';
    }
  }


  themeChanged() {
    let currentTheme = localStorage.getItem('theme');
    this.currentThemeMode = currentTheme;
    if (this.currentThemeMode == null || this.currentThemeMode == undefined) {
      this.currentThemeMode = 'light';
    }
  }

  get randomNumber(): number {
    return Math.floor(Math.random() * 1000000);  // Random number between 0 and 999999
  }

  trackByFn(index: number, item: any): number {
    return item.id; // or any unique identifier
  }


}


