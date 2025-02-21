import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { ClubService } from '../../../../services/club.service';
import { MatDialog } from '@angular/material/dialog';
import { AddNewTalentComponent } from '../add-new-talent/add-new-talent.component';

@Component({
  selector: 'club-teams-tab',
  templateUrl: './teams-tab.component.html',
  styleUrl: './teams-tab.component.scss'
})
export class TeamsTabComponent {

  userId:any = '';
  teams:any = [];
  players:any = [];
  view: string = "team";
  displayedColumns: string[] = ['Player Name','Joining Date','Exit Date','Location','Edit'];
  isLoading:boolean = false;
  selectedTeam:any = "";
  selectedTeamId:any;
  @Input() userData: any;

  constructor(private route: ActivatedRoute, private userService: UserService, private clubService: ClubService, private router: Router, public dialog: MatDialog){}

  ngOnInit(){
    this.userId = this.userData.id;
    this.getClubTeams(this.userId)
  }

  getClubTeams(userId:any){
    this.isLoading = true;
    try {
      this.userService.getClubTeams(userId).subscribe((response)=>{
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
      console.error('Error fetching users:', error);
    }
  }

  getTeamPlayers(teamId:any, teamName:any){
    this.selectedTeam = teamName;
    this.selectedTeamId = teamId;
    this.view = 'player';
    this.isLoading = true;
    try {
      this.clubService.getClubTeamPlayers(teamId).subscribe((response)=>{
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

  backToTeamView(){
    this.view = 'team';
    this.players = [];
  }

  navigate(playerId:any){
    let pageRoute = 'view/player';
    this.router.navigate([pageRoute, playerId]);
  }


  addPlayer(){

    const messageDialog = this.dialog.open(AddNewTalentComponent,{
      width: '800px',
      data: {
        teamId: this.selectedTeamId,
        player: [],
        edit: false,
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      console.log('result',result);
      this.getTeamPlayers(this.selectedTeamId, this.selectedTeam);
    });

  }

  editPlayer(player:any){
    console.log('player',player);
    const messageDialog = this.dialog.open(AddNewTalentComponent,{
      width: '800px',
      data: {
        teamId: this.selectedTeamId,
        player: player,
        edit: true,
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      this.getTeamPlayers(this.selectedTeamId, this.selectedTeam);
    });

  }

}
