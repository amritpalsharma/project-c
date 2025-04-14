import { Component, Input } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
@Component({
  selector: 'app-scout-portfolio',
  templateUrl: './scout-portfolio.component.html',
  styleUrl: './scout-portfolio.component.scss'
})
export class ScoutPortfolioComponent {

  constructor(public userService: UserService) { }
  isLoading: boolean = true;
  scoutPlayers: any;
  uploadsPath: string = '';
  logoPath: string = '';
  @Input() isPremium: any;
  @Input() currentScoutId: any;
  displayedColumns: string[] = ['Name', 'Language', 'Club', 'Status'];
  // displayedColumns: string[] = ['Name', 'Language', 'Club', 'Status', 'View'];

  ngOnInit(): void {
    this.getScoutPlayers();
  }
  getScoutPlayers() {
    this.isLoading = true;
    try {
      this.userService.userGetScoutPlayers(this.currentScoutId).subscribe((response: any) => {
        if (response && response.status && response.data) {
          if (response.data.scoutPlayers) {
            this.scoutPlayers = response.data.scoutPlayers;
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
}
