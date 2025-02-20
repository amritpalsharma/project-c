import { LiveAnnouncer} from '@angular/cdk/a11y';
import { COMMA, ENTER} from '@angular/cdk/keycodes';
import { Component, Inject,ViewChild,ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { inject } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { UserService } from '../../../../services/user.service';
import { TalentService } from '../../../../services/talent.service';
@Component({
  selector: 'shared-chat-popup',
  templateUrl: './chat-popup.component.html',
  styleUrls: ['./chat-popup.component.scss']
})

export class ChatPopupComponent {
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly announcer = inject(LiveAnnouncer);
  filteredUsers:any = [];
  users:any = [];
  allUsers:any = [];
  @ViewChild("userInput") userInput!: ElementRef;

  constructor(
    private userService: UserService,
    private talentService: TalentService,
    public dialogRef: MatDialogRef<ChatPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void { 
    this.fetchUsers();
  }
 
  async fetchUsers(): Promise<void> {
    try {
      this.talentService.getAllUses().subscribe((response) => {
        console.log('User API response:', response);  // Debugging line
        if (response && response.status && response.data && response.data.userData) {
          this.allUsers = response.data.userData.users || [];
          this.filteredUsers = [...this.allUsers]; // Initialize filtered list
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

  startChat(){
    this.dialogRef.close({ data: this.users });
  }

  onClickOutside() {
    this.dialogRef.close();
  }

  callListApi(userInput: HTMLInputElement) {
    if (!this.allUsers || !Array.isArray(this.allUsers)) {
      console.error('User data is not available');
      return;
    }

    const searchText = userInput.value.toLowerCase().trim();
    this.filteredUsers = this.allUsers.filter((user: any) =>
      user.first_name && user.first_name.toLowerCase().includes(searchText)
    );
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
