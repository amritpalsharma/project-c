import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-performance-tab',
  templateUrl: './performance-tab.component.html',
  styleUrl: './performance-tab.component.scss'
})
export class PerformanceTabComponent {
  isLoading: boolean = false;
  isEditing: boolean = false;
  userId:any = "";
  performances:any = [];
  editableId: string = "";
  teams:any = [];
  filteredTeams:any = [];
  dataTOBeUpdated:any = {
    coach: "",
    team_id: "",
    matches: "",
    goals: "",
    session: "",
    player_age: ""
  }

  inputValue:any = "";
  // from_date:2021-01-01
  //   to_date:2022-01-01
  constructor(private route: ActivatedRoute, private userService: UserService, private router: Router) { } 
  
  ngOnInit(): void {
    this.route.params.subscribe((params:any) => {
      console.log(params.id)
      this.userId = params.id;
      this.getUserPerformance(this.userId);
    });
    this.getAllTeams();
  }

  getUserPerformance(userId:any){


    this.isLoading = true;
    try {
      this.userService.getPerformanceData(userId).subscribe((response)=>{
        if (response && response.status && response.data && response.data.performanceDetail) {
          this.editableId = "";
          this.performances = response.data.performanceDetail;
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

  getAllTeams(){
    this.userService.getAllTeams().subscribe((response)=>{
      if (response && response.status && response.data && response.data.teams) {
        this.teams = response.data.teams;
      }
    });
  }

  editPerformance(performanceId:any){
    console.log(performanceId)
    this.inputValue = "";
    this.editableId = performanceId;
    let index = this.performances.findIndex((x:any) => x.id == performanceId);
    let currentRow = this.performances[index];
    console.log(currentRow, 'current-row');
    this.dataTOBeUpdated = {
      coach: currentRow.coach,
      team_id: currentRow.team_id,
      matches: currentRow.matches,
      goals: currentRow.goals,
      session: currentRow.session,
      player_age: currentRow.player_age
    }
    this.inputValue = currentRow.country_name;
  }

  
  savePerformance(performanceId:any){

    // let index = this.performances.findIndex((x:any) => x.id == performanceId);

    // let teamInfo = this.getUpdatedTeamInfoToDisplay(this.dataTOBeUpdated.team_id)
    // let updatedIndexData = this.dataTOBeUpdated;
    // updatedIndexData.id = performanceId;


    // this.performances[index] = updatedIndexData;

    // console.log(JSON.stringify(this.performances))
    // this.editableId = "";
    this.userService.updatePerformance(performanceId, this.dataTOBeUpdated).subscribe((response)=>{
      // console.log(response)
      // this.editableId = "";
      if(response.status){
        this.performances = [];
        this.getUserPerformance(this.userId);
      }
    }); 
  }

  onSelectChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.updateRow('team_id',Number(selectElement.value));
  }

  onInputChange(event: Event, key:string): void {
    let inputElement = event.target as HTMLInputElement;
    this.updateRow(key,inputElement.value);
  }

  updateRow(key:any, value:any){
    this.dataTOBeUpdated[key] = value;
  }

  suggestTeams(event: Event): void {
    let inputElement = event.target as HTMLInputElement;
    let keyword = inputElement.value;

    if(keyword == ""){
      this.filteredTeams = [];
    }else{
      this.filteredTeams = this.teams.filter((item:any) => item.team_name.toLowerCase().indexOf(keyword.toLowerCase()) === 0);
    } 
  }

  selectTeam(teamId:any, name:any, country:any){
    console.log(teamId, name, country, 'testing');
    this.inputValue = name+", "+country;
    this.updateRow('team_id',teamId);
    this.filteredTeams = [];
  }
}

