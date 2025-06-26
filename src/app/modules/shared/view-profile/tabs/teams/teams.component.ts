import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../../services/user.service';
import { ClubService } from '../../../../../services/club.service';
import { WebPages } from '../../../../../services/webpages.service';

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
  displayedColumns: string[] = ['Player Name', 'Joining Date', 'Exit Date', 'Location', 'View'];
  isLoading: boolean = false;
  selectedTeam: any = "";
  selectTeamName: string = '';
  selectedTeamId: any;
  @Input() userData: any;
  @Input() isPremium: any;
  @Input() currentClubId: any;
  team_group: string = 'm';

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private clubService: ClubService,
    private webPages: WebPages,
    private router: Router
  ) {
    // this.getClubTeams(this.currentClubId);
  }

  ngOnInit(): void {
    this.getClubTeams(this.currentClubId);

    this.webPages.languageId$.subscribe((data) => {
      // 
      if (this.view == 'player') {
        this.getTeamPlayers(this.selectedTeamId, this.selectedTeam);
      } else {
        this.getClubTeams(this.currentClubId);
      }
    });
  }

  changeTeamType(team_type: any) {
    this.team_group = team_type;
    this.getClubTeams(this.currentClubId)
  }
  getClubTeams(userId: any) {
    this.isLoading = true;
    try {
      this.userService.getClubTeamsByGroup(userId, this.team_group).subscribe((response) => {
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
      this.clubService.getClubPlayers(teamId).subscribe((response) => {
        if (response && response.status && response.data) {
          this.players = response.data.players;
          console.log(this.players)
          this.isLoading = false;
        } else {
          this.players = [];
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

  naviGatePlayer(id: number) {
    let slug = 'talent';
    const pageRoute = 'view/' + slug.toLowerCase();
    //console.log(pageRoute);
    this.router.navigate([pageRoute, id], { state: { role: slug } });
  }
}
