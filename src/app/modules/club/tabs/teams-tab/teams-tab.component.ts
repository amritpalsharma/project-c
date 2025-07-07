import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { ClubService } from '../../../../services/club.service';
import { MatDialog } from '@angular/material/dialog';
import { AddNewTalentComponent } from '../add-new-talent/add-new-talent.component';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { UnverifiedUserComponent } from '../../../shared/unverified-user/unverified-user.component';
import { MessagePopupComponent } from '../../../shared/message-popup/message-popup.component';

@Component({
  selector: 'club-teams-tab',
  templateUrl: './teams-tab.component.html',
  styleUrl: './teams-tab.component.scss'
})
export class TeamsTabComponent {

  userId: any = '';
  teams: any = [];
  players: any = [];
  view: string = "team";
  displayedColumns: string[] = [ 'Player Name', 'Joining Date', 'Exit Date', 'JersyNumber', 'view', 'Edit', 'Delete'];
  isLoading: boolean = false;
  selectedTeam: any = "";
  selectTeamName: string = '';
  selectedTeamId: any;
  @Input() userData: any;
  @Input() isPremium: any;
  @Input() isUserVerified: any;
  @Input() currentLoggedInPermission: any;


  confirmDeleteinformationTeam: string = '';
  errortxt: string = '';

  team_group: string = 'm';

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private clubService: ClubService,
    private router: Router,
    public dialog: MatDialog,
    public toaster: ToastrService,
    public translateService: TranslateService
  ) {
    this.getToasterMsg();
    translateService.onLangChange.subscribe(() => {
      this.getToasterMsg();
      // this.userId = this.userData.id;
      this.getTeamPlayers(this.selectedTeamId, this.selectedTeam);
    });
  }

  ngOnInit() {
    console.log(this.userData)
    this.userId = this.userData.id;
    this.getClubTeams(this.userId)
  }

  changeTeamType(team_type: any) {
    this.team_group = team_type;
    this.getClubTeams(this.userId)
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
      this.clubService.getClubTeamPlayers(teamId).subscribe((response) => {
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
    // this.team_group = 'm';
  }

  navigate(playerId: any) {
    let pageRoute = 'view/player';
    this.router.navigate([pageRoute, playerId]);
  }

  onNavigate(elementId: any): void {
    this.router.navigate([`view/talent/${elementId}`]);
  }
  addPlayer() {
    if (!this.hasPermissionToAdd()) {
      return; // If no permission, exit early
    }
    const messageDialog = this.dialog.open(AddNewTalentComponent, {
      width: '800px',
      data: {
        teamId: this.selectedTeamId,
        player: [],
        edit: false,
        teamName: this.selectTeamName,
        team_group: this.team_group
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      console.log('result', result);
      setTimeout(() => {
        this.getTeamPlayers(this.selectedTeamId, this.selectedTeam);
      }, 1500);
      if (result.message != '') {
        this.toaster.info(result.message);
      }
    });

  }

  editPlayer(player: any) {
    console.log('player', player);
    const messageDialog = this.dialog.open(AddNewTalentComponent, {
      width: '800px',
      data: {
        teamId: this.selectedTeamId,
        player: player,
        edit: true,
        teamName: this.selectTeamName
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      setTimeout(() => {
        this.getTeamPlayers(this.selectedTeamId, this.selectedTeam);
      }, 1500);
      if (result.message != '') {
        this.toaster.info(result.message);
      }
    });

  }
  getTeamTypeById(id: number) {
    const team = this.teams.find((team: any) => team.id === id);
    return team ? team.team_type : null; // Return `null` if not found
  }

  navigatePlans() {
    this.router.navigate(['/club/plans']);
  }

  hasPermissionToDelete(): boolean {
    if (this.currentLoggedInPermission === 'club_edit_only') {
      console.info('YOU DO NOT HAVE PERMISSION TO DELETE RECORDS');
      return false; // Return false if the user doesn't have permission
    }
    return true; // Return true if the user has permission
  }

  hasPermissionToAdd(): boolean {
    if (this.currentLoggedInPermission === 'club_edit_only') {
      console.info('YOU DO NOT HAVE PERMISSION TO Add RECORDS');
      return false; // Return false if the user doesn't have permission
    }
    return true; // Return true if the user has permission
  }
  confirmDelete(details: any) {

    if (this.currentLoggedInPermission == 'club_edit_only') {
      console.info('YOU DO NOT HAVE PERMISSION TO DELETE RECORDS');
      return;
    }
    console.log(details);
    const messageDialog = this.dialog.open(MessagePopupComponent, {
      width: '500px',
      position: {
        top: '150px'
      },
      data: {
        message: this.confirmDeleteinformationTeam,
        action: 'delete-Teamplayer-confirmation'
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.action == "delete-confirmed") {
          if (typeof details.id !== undefined && details.id != '') {
            this.deleteTeamPlayer(details.id);
          } else {
            console.log('Player Not found ', details)
          }
        }
      }
    });
  }

  getToasterMsg() {
    this.translateService.get([
      'confirmDeleteinformationTeam',
      // 'selectSightingFirst'
    ]).subscribe((translations) => {
      this.confirmDeleteinformationTeam = translations['confirmDeleteinformationTeam'];
      // this.errortxt = translations['selectSightingFirst'];
    });
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

  deleteTeamPlayer(delete_id: any) {
    try {
      this.clubService.deleteTeamPlayer(delete_id).subscribe((response) => {
        console.log(response)
        if (response && response.status) {
          console.info(response);
          this.clubService.successMessage(response.message);
          this.getTeamPlayers(this.selectedTeamId, this.selectedTeam);
        } else {

          this.clubService.apiToastError(response.message);
        }
      });
    } catch (error) {
      this.clubService.apiToasterError();
    }
  }
}
