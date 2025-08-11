import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { UserRoleService } from '../../../../services/user-role.service';
import { MatDialog } from '@angular/material/dialog';
import { AddTeamPlayerComponent } from '../add-team-player/add-team-player.component';

@Component({
  selector: 'app-teams-tab',
  templateUrl: './teams-tab.component.html',
  styleUrl: './teams-tab.component.scss'
})
export class TeamsTabComponent {

  userId: any = '';
  teams: any = [];
  players: any = [];
  view: string = "team";
  displayedColumns: string[] = ['Player Name', 'JersyNumber', 'Joining Date', 'Exit Date', 'Location', 'Edit'];
  isLoading: boolean = false;
  selectedTeam: any = "";
  team_group: string = 'm';
  constructor(
    public dialog: MatDialog,
    public userRoleService: UserRoleService,
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router) { }


  ngOnInit() {
    this.route.params.subscribe((params: any) => {
      this.userId = params.id;
      this.getClubTeams(this.userId)
    })
  }

  getClubTeams(userId: any) {
    this.isLoading = true;
    try {
      this.userService.getClubTeamsByGroup(userId, this.team_group).subscribe((response) => {
        if (response && response.status && response.data) {
          this.teams = response.data.teams;
          this.isLoading = false;
        } else {
          this.teams = [];
          this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      // this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }
  selectedTeamID: any;
  getTeamPlayers(teamId: any, teamName: any) {
    this.selectedTeam = teamName;
    this.selectedTeamID = teamId;
    this.view = 'player';
    this.isLoading = true;
    try {
      this.userService.getTeamPlayers(teamId).subscribe((response) => {
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

  navigate(player: any) {

    // console.info(player)
    // let pageRoute = 'admin/talent';
    // this.router.navigate([pageRoute, playerId]);

    const messageDialog = this.dialog.open(AddTeamPlayerComponent, {
      width: '800px',
      panelClass: 'club_add_team_popup',
      position: {
        top: '150px'
      },
      data: {
        user_id: this.userId,
        teamId: this.selectedTeamID,
        player: player,
        edit: true,
      }
    })

    messageDialog.afterClosed().subscribe(result => { })
  }

  changeTeamType(team_type: any) {
    this.team_group = team_type;
    this.getClubTeams(this.userId);
  }

  addPlayerToTeam() {
    const messageDialog = this.dialog.open(AddTeamPlayerComponent, {
      width: '800px',
      panelClass: 'club_add_team_popup',
      position: {
        top: '150px'
      },
      data: {
        user_id: this.userId,
        teamId: this.selectedTeamID
      }
    })

    messageDialog.afterClosed().subscribe(result => { })
  }
}
