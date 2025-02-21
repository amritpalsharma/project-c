import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { inject } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { UserService } from '../../../../services/user.service';
import { ClubService } from '../../../../services/club.service';

@Component({
  selector: 'add-new-talent',
  templateUrl: './add-new-talent.component.html',
  styleUrls: ['./add-new-talent.component.scss']
})
export class AddNewTalentComponent implements OnInit {

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly announcer = inject(LiveAnnouncer);
  filteredUsers: any = [];
  users: any = [];
  allUsers: any = [];
  @ViewChild("userInput") userInput!: ElementRef;
  action: any = "";
  invitedUsers: any = [];
  eventName: any = "";
  sightId: any = "";
  startDate: string | null = null;
  endDate: string | null = null;
  noEndDate: boolean = false;
  teamId: any;
  player: any;
  edit: boolean = false;

  constructor(
    private clubService: ClubService,
    public dialogRef: MatDialogRef<AddNewTalentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.teamId = data.teamId;
    this.player = data.player;
    this.edit = data.edit;
  }

  ngOnInit(): void {
    this.fetchPlayers();
    if (this.edit && this.player) {
      this.initializeFormFields();
    }
  }

  initializeFormFields(): void {
    this.startDate = this.player.join_date;
    this.endDate = this.player.end_date;
    this.noEndDate = this.player.no_end_date === '1';
    this.users = [this.player]; // Assuming you want to pre-fill the user
  }

  async fetchPlayers(): Promise<void> {
    try {
      this.clubService.getAllPlayers().subscribe((response) => {
        if (response && response.status && response.data && response.data.userData) {
          this.allUsers = response.data.userData.users;
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

  sendInvite() {
    const formData = new FormData();
    let i = 0;
    this.users.map((user: any) => {
      formData.append(`players[${i}][player_id]`, user.id);
      formData.append(`players[${i}][team_id]`, this.teamId);
      formData.append(`players[${i}][join_date]`, this.startDate || '');
      formData.append(`players[${i}][end_date]`, this.noEndDate ? '' : this.endDate || '');
      formData.append(`players[${i}][no_end_date]`, this.noEndDate ? '1' : '0');
      i += 1;
    });

    if (this.edit) {
      this.updatePlayer(formData);
    } else {
      this.addPlayer(formData);
    }
  }

  addPlayer(formData: FormData) {
    this.clubService.addTeamPlayer(formData).subscribe((response) => {
      if (response && response.status) {
        this.dialogRef.close({
          action: 'added',
          id: this.sightId,
        });
      } else {
        console.error('Invalid API response structure:', response);
      }
    });
  }

  updatePlayer(formData: FormData) {
    this.clubService.updateTeamPlayer(this.player.id, formData).subscribe((response) => {
      if (response && response.status) {
        this.dialogRef.close({
          action: 'updated',
          id: this.player.id,
        });
      } else {
        console.error('Invalid API response structure:', response);
      }
    });
  }

  onKeyPress(event: any) {
    let keyword = event.target.value;
    console.log(keyword); // You can use this to see the current input value

    this.filteredUsers = this.allUsers.filter((user: any) => (user.first_name !== null && user.first_name !== undefined) &&
      user.first_name.toLowerCase().indexOf(keyword.toLowerCase()) != -1);
  }

  onClickOutside() {
    this.dialogRef.close();
  }

  callListApi(userInput: HTMLInputElement) {
    setTimeout(() => {
      this.filteredUsers = this.allUsers.filter((user: any) => (user.first_name !== null && user.first_name !== undefined) &&
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
    if (!this.users?.length) {
      this.users.push(event.option.value);
      this.userInput.nativeElement.value = "";
    } else if (this.users?.length && !this.users.find((user: any) => user.id === event.option.value.id)) {
      this.users.push(event.option.value);
      this.userInput.nativeElement.value = "";
    } else {
      this.userInput.nativeElement.value = "";
    }
  }
}
