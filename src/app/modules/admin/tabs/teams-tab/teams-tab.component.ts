import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-teams-tab',
  templateUrl: './teams-tab.component.html',
  styleUrl: './teams-tab.component.scss'
})
export class TeamsTabComponent {

  userId:any = '';
  teams:any = [];
  players:any = [];
  view: string = "team";
  displayedColumns: string[] = ['Player Name', 'Joining Date', 'Exit Date', 'Location','Edit'];
  isLoading:boolean = false;
  selectedTeam:any = "";
  constructor(private route: ActivatedRoute, private userService: UserService, private router: Router){}


  ngOnInit(){
    this.route.params.subscribe((params:any) => {
      this.userId = params.id;
      this.getClubTeams(this.userId)
    })
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
      // this.isLoading = false;
      console.error('Error fetching users:', error); 
    }
  }

  getTeamPlayers(teamId:any, teamName:any){
    this.selectedTeam = teamName;
    this.view = 'player';
    this.isLoading = true;
    try {
      this.userService.getTeamPlayers(teamId).subscribe((response)=>{
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
    let pageRoute = 'admin/player';
    this.router.navigate([pageRoute, playerId]);
  }
}
