import { COMMA, ENTER} from '@angular/cdk/keycodes';
import { Component, Inject,ViewChild,ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChangeDetectionStrategy, computed, inject, model, signal } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { UserService } from '../../../../services/user.service';
import { TalentService } from '../../../../services/talent.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-invite-talent-popup',
  templateUrl: './invite-talent-popup.component.html',
  styleUrl: './invite-talent-popup.component.scss'
})
export class InviteTalentPopupComponent {
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly announcer = inject(LiveAnnouncer);
  filteredUsers:any = [];
  users:any = [];
  allUsers:any = [];
  @ViewChild("userInput") userInput!: ElementRef;
  action:any = "";
  invitedUsers:any = [];
  eventName:any = "";
  sightId:any = "";
  constructor(
    private userService: UserService,
    private talentService: TalentService,
    public dialogRef: MatDialogRef<InviteTalentPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(data);
    this.action = data.action;
    if(this.action == "showInvitedUsers"){
      this.invitedUsers = data.data
    }else if(this.action == "inviteUsers"){
      this.eventName = data.data;
      this.sightId = data.sightId;
    }
  }

  ngOnInit(): void {
    this.fetchPlayers();
  }
 
  async fetchPlayers(): Promise<void> {
    try {
      this.userService.getAllPlayers().subscribe((response)=>{
        if (response && response.status && response.data && response.data.userData) {
          this.allUsers = response.data.userData; 
          } else {
            console.error('Invalid API response structure:', response);
          }
        });     
      } catch (error) {
        console.error('Error fetching users:', error);
      }
  
  }

  close() {
    this.dialogRef.close();
  }

  sendInvite(){
    const formData = new FormData();  
    this.users.map(function(user:any) {
      formData.append('invites[]', user.id);
    });

    this.userService.sendSightingInvite(this.sightId, formData).subscribe((response)=>{
      if (response && response.status) {
        this.dialogRef.close({
          action: 'added',
          id: this.sightId
        });
      
      } else {
        console.error('Invalid API response structure:', response);
      }
    });     
  }

  onKeyPress(event: any){
    let keyword = event.target.value;
    console.log(keyword); // You can use this to see the current input value

    this.filteredUsers = this.allUsers.filter((user:any) => (user.first_name !== null && user.first_name !== undefined)  && 
      user.first_name.toLowerCase().indexOf(keyword.toLowerCase()) != -1);
  }

  onClickOutside() {
    this.dialogRef.close();
  }

  callListApi(userInput: HTMLInputElement) {
    setTimeout(() => {
      this.filteredUsers = this.allUsers.filter((user:any) => (user.first_name !== null && user.first_name !== undefined)  && 
      user.first_name.toLowerCase().indexOf(userInput.value.toLowerCase()) != -1
      );
    }, 2000);
    console.log(userInput.value);
  }

  remove(user: any): void {
    const index = this.users.indexOf(user);
    if (index >= 0) {
      this.users.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (!this.users?.length){
      this.users.push(event.option.value);
      this.userInput.nativeElement.value = "";
    }else if (this.users?.length && !this.users.find((user:any) => user.id === event.option.value.id)) {
      this.users.push(event.option.value);
      this.userInput.nativeElement.value = "";
    } else {
      this.userInput.nativeElement.value = "";
    }
  }
 
}
