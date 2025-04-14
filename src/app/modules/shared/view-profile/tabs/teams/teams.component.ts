import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../../services/user.service';
import { ClubService } from '../../../../../services/club.service';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.scss'
})
export class TeamsComponent {


  userId: any = '';
  teams: any = [];
  players: any = [];
  view: string = "team";
  displayedColumns: string[] = ['Player Name', 'Joining Date', 'Exit Date', 'Location', 'Edit'];
  isLoading: boolean = false;
  selectedTeam: any = "";
  selectTeamName: string = '';
  selectedTeamId: any;
  @Input() userData: any;
  @Input() isPremium: any;
  @Input() currentClubId: any;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private clubService: ClubService
  ) {
    // this.getClubTeams(this.currentClubId);
  }

  ngOnInit(): void {
    this.getClubTeams(this.currentClubId);
  }

  getClubTeams(userId: any) {
    this.isLoading = true;
    try {
      this.userService.getTeamsByClub(userId).subscribe((response) => {
        if (response && response.status && response.data != '') {
          this.teams = response.data.teams;
          this.isLoading = false;
        } else {
          this.teams = [];
          this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  getTeamPlayers(teamId: any, teamName: any) {
    console.log('Teams', this.teams)
    this.selectedTeam = teamName;
    this.selectedTeamId = teamId;
    this.selectTeamName = this.getTeamTypeById(teamId);
    console.log('selected team is ', this.selectTeamName)
    this.view = 'player';
    this.isLoading = true;
    try {
      this.clubService.getClubTeamPlayers(teamId).subscribe((response) => {
        if (response && response.status && response.data) {
          this.players = response.data.players;
          console.log(this.players)
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

  backToTeamView() {
    this.view = 'team';
    this.players = [];
  }

  getTeamTypeById(id: number) {
    const team = this.teams.find((team: any) => team.id === id);
    return team ? team.team_type : null; // Return `null` if not found
  }
}
