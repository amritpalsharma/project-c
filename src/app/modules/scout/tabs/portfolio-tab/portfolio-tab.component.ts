import { Component, Input, signal, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { ScoutService } from '../../../../services/scout.service';
import { AddNewTalentComponent } from './add-new-talent/add-new-talent.component';
import { ChangeDetectionStrategy, inject, model,  } from '@angular/core';
import { ScoutPlayerViewPopupComponent } from '../../../admin/tabs/scout-player-view-popup/scout-player-view-popup.component';
import { MessagePopupComponent } from '../../message-popup/message-popup.component';
import { InviteScoutTalentPopupComponent } from '../../invite-scout-talent-popup/invite-scout-talent-popup.component';
export interface DialogData {
  animal: string;
  name: string;
}
@Component({
  selector: 'scout-portfolio-tab',
  templateUrl: './portfolio-tab.component.html',
  styleUrl: './portfolio-tab.component.scss'
})
export class PortfolioTabComponent {
  readonly animal = signal('');
  readonly name = model('');

  constructor(private route: ActivatedRoute, private scoutservice: ScoutService, private scoutService: ScoutService, public dialog: MatDialog, private router: Router) { }

  userId:any = '';
  user:any ;
  scoutPlayers:any = [];
  displayedColumns: string[] = ['Name', 'Language', 'Club', 'Contract Starts','Contract Expires', 'View', 'Delete'];
  isLoading = false;
  idToBeDeleted:any = '';
  @Input() userData: any;

  ngOnInit(): void{
    this.user = this.userData;
    this.userId = this.user.id;
    this.getScoutPlayers();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userData']) {
      // Update the user object with the latest userData
      this.user = changes['userData'].currentValue;

    }
  }

  addNewTalet() {
    const dialogRef = this.dialog.open(AddNewTalentComponent, {
      width: '600px',
      height:'450px',
      position: {
        top:'70px'
      },
      data: {
        scoutId: this.user.id
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      if (result !== undefined) {
        this.animal.set(result);
      }
    });
  }


  inviteTalent(){
    const inviteDialog = this.dialog.open(InviteScoutTalentPopupComponent,{
      width: '600px',
      height:'450px',
      position: {
        top:'70px'
      },
      data: {
        scoutId: this.userId
      }
    })

    inviteDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        console.log(result)
        if(result.action == "added"){
          this.showMatDialog("Players invited successfully", 'display')
        }
         console.log('Dialog result:', result);
      }
    });
  }

  getScoutPlayers(){
    this.isLoading = true;
    try {
      this.scoutservice.getScoutPlayers().subscribe((response)=>{
        if (response && response.status && response.data) {
          this.scoutPlayers = response.data.scoutPlayers;
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

  viewScoutPlayer(playerId:any){
    const playerViewDialog = this.dialog.open(ScoutPlayerViewPopupComponent,{
      width: '1000px',
      height: '600px',
      position: {
        top:'30px'
      },
      data: {
        playerId: playerId
      }
    })

    playerViewDialog.afterClosed().subscribe(result => {
      // if (result !== undefined) {
        //  console.log('Dialog result:', result);
      // }
    });
  }

  confirmDeletion(id:any, firstName:any, lastName:any){
    this.idToBeDeleted = 110; //id;
    let name = firstName+" "+lastName;
    console.log(id, firstName, lastName);
    this.showMatDialog("", "delete-scout-player-confirmation", name);
  }

  showMatDialog(message:string, action:string, name:any = ''){
    const messageDialog = this.dialog.open(MessagePopupComponent,{
      width: '500px',
      position: {
        top:'150px'
      },
      data: {
        message: message,
        action: action,
        name: name
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if(result.action == "delete-confirmed"){
          this.deleteScoutPlayer();
        }
      //  console.log('Dialog result:', result);
      }
    });
  }

  deleteScoutPlayer(){
    this.scoutservice.deleteScoutPlayer(this.idToBeDeleted).subscribe((response:any) => {
        this.showMatDialog('Player removed from Scout successfully!', 'display');
        this.getScoutPlayers();
    },
    (error:any) => {
        console.error('Error deleting user:', error);
        this.showMatDialog('Error deleting user. Please try again.', 'display');
      }
    );
  }
}
