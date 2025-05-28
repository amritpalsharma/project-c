import { Component, Input } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { WebPages } from '../../../../../services/webpages.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-scout-portfolio',
  templateUrl: './scout-portfolio.component.html',
  styleUrl: './scout-portfolio.component.scss'
})
export class ScoutPortfolioComponent {

  constructor(private route: Router, public userService: UserService, public webPages: WebPages) { }
  isLoading: boolean = true;
  scoutPlayers: any;
  uploadsPath: string = '';
  logoPath: string = '';
  @Input() isPremium: any;
  @Input() currentScoutId: any;
  displayedColumns: string[] = ['Name', 'Language', 'Club', 'Status', 'View'];
  baseUrl: string = 'https://api.socceryou.ch/uploads/';
  // displayedColumns: string[] = ['Name', 'Language', 'Club', 'Status', 'View'];

  ngOnInit(): void {
    this.getScoutPlayers();

    this.webPages.languageId$.subscribe((data: any) => {
      this.getScoutPlayers();
    });
  }

  getScoutPlayers() {
    this.isLoading = true;
    try {
      this.userService.userGetScoutPlayers(this.currentScoutId).subscribe((response: any) => {
        if (response && response.status && response.data) {
          if (response.data.scoutPlayers) {
            this.scoutPlayers = response.data.scoutPlayers;
            // console.info('this.scoutPlayers',this.scoutPlayers)
            let acceptedPlayers = this.scoutPlayers.filter((player: any) => player.is_accepted === 'accepted');
            this.scoutPlayers = acceptedPlayers;
          }
          else {
            this.scoutPlayers = []
          }
          this.uploadsPath = response.data.uploadsPath;
          this.logoPath = response.data.logoPath;
          this.isLoading = false;
        } else {
          this.scoutPlayers = []
          this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

  getStatusClass(status: any): string {
    if (status === null) return 'status-pending';
    return status === 'accepted' ? 'status-accepted' : 'status-rejected';
  }

  navigateToProfiel(id: any) {
    // const role = this.loggedInUser.role_name.toLowerCase();
    this.route.navigate([`/view/talent`, id]);
  }
}
