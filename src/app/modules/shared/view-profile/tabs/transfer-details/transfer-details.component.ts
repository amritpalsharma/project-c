import { Component, Input } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ActivatedRoute, Router } from '@angular/router';
import { TalentService } from '../../../../../services/talent.service';
import { MatDialog } from '@angular/material/dialog';
import { WebPages } from '../../../../../services/webpages.service';
import { GlobalSettingsService } from '../../../../../services/global-settings.service';

@Component({
  selector: 'view-user-transfer-details',
  templateUrl: './transfer-details.component.html',
  styleUrl: './transfer-details.component.scss'
})
export class TransferDetailsComponent {
  baseUrl:string='https://api.socceryou.ch/uploads/logos/';
  theme: string = localStorage.getItem('theme') || 'light';
  defaultDate: Date = new Date(2023, 4, 21); // May 21, 2023
  userId: any = '';
  userTransfers: any = [];
  editableId: string = "";
  teams: any = [];
  dataTOBeUpdated: any = {
    team_from: "",
    team_to: "",
    session: "",
    date_of_transfer: ""
  }
  seasons: any = [];
  isLoading: boolean = true;
  constructor(
    private route: ActivatedRoute,
    private talentService: TalentService,
    private router: Router,
    public dialog: MatDialog,
    public globalSettings:GlobalSettingsService,
    public webPages: WebPages) { }
  @Input() isPremium: any;

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      this.userId = params.id;
      if (this.isPremium) {
        this.getUserTransfers(this.userId);
      }
    });
    this.getSeasonsOptions();

    this.webPages.languageId$.subscribe((data: any) => {
      if (this.isPremium) {
        this.getUserTransfers(this.userId);
      }
    });

    this.themeChanged();

    this.globalSettings.indexFunctionCall$.subscribe(() => {
      this.themeChanged(); // Call the function when event is received
    });
  }

  getSeasonsOptions() {
    const startYear = 2000;
    const currentYear = new Date().getFullYear();

    // Populate the years array from startYear to currentYear
    for (let year = startYear; year <= currentYear; year++) {
      this.seasons.push(year);
    }
  }

  getUserTransfers(id: any) {
    this.isLoading = true;
    try {
      this.talentService.getViewTransfersData(id).subscribe((response) => {
        if (response && response.status && response.data) {
          this.userTransfers = response.data.transferDetail;
          this.isLoading = false;
        } else {
          this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }


  onDateChange(event: MatDatepickerInputEvent<Date>): void {
    const selectedDate = event.value;
    let date = this.formatDate(selectedDate);
    this.updateRow('date_of_transfer', date);
  }

  onInputChange(event: Event, key: string): void {
    let inputElement = event.target as HTMLInputElement;
    this.updateRow(key, inputElement.value);
  }

  updateRow(key: any, value: any) {
    this.dataTOBeUpdated[key] = value;

    console.log(this.dataTOBeUpdated);
  }

  formatDate(date: any) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  themeChanged() {
    let currentTheme = localStorage.getItem('theme') || 'light';
    this.theme = currentTheme;
    if (this.theme == null || this.theme == undefined) {
      this.theme = 'light';
    }
  }
}


