import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { inject } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { UserService } from '../../../../services/user.service';
import { ClubService } from '../../../../services/club.service';
import { SocketService } from '../../../../services/socket.service';
import { FormControl, NgForm } from '@angular/forms';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';
const moment = _rollupMoment || _moment;

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
  // startDate: string | null = null;
  startDate: FormControl = new FormControl(null);
  endDate: FormControl = new FormControl(null);
  // endDate: string | null = null;
  noEndDate: boolean = false;
  teamId: any;
  player: any;
  edit: boolean = false;
  teamName: string = '';
  baseUrl: string = 'https://api.socceryou.ch/uploads/';
  theme: string = localStorage.getItem('theme') || 'light';
  submitClicked: boolean = false;

  constructor(
    private clubService: ClubService,
    public dialogRef: MatDialogRef<AddNewTalentComponent>,
    private socketService: SocketService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.teamId = data.teamId;
    this.player = data.player;
    this.edit = data.edit;
    this.teamName = data.teamName;

    this.startDate.setValue(this.player.join_date ? new Date(this.player.join_date) : null);
  }

  ngOnInit(): void {
    this.fetchPlayers();
    if (this.edit && this.player) {
      this.initializeFormFields();
    }
  }

  initializeFormFields(): void {
    // this.startDate = this.player.join_date;
    this.startDate = new FormControl(
      this.player.join_date ? new Date(this.player.join_date) : null
    );
    this.endDate = new FormControl(
      this.player.end_date ? new Date(this.player.end_date) : null
    );
    // this.endDate = this.player.end_date;
    this.noEndDate = this.player.no_end_date === '1';
    this.users = [this.player]; // Assuming you want to pre-fill the user
  }

  async fetchPlayers(): Promise<void> {
    try {
      this.clubService.getAllPlayers().subscribe((response) => {
        if (response && response.status && response.data && response.data.userData) {
          this.allUsers = response.data.userData.users;
          console.info(this.allUsers)
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

  receiverIds: any[] = [];

  sendInvite() {
    this.submitClicked = true;
    const formData = new FormData();
    let i = 0;
    let lang_id = localStorage.getItem('lang_id');
    formData.append(`lang`, lang_id + '');
    console.log(this.users);
    // return
    this.users.map((user: any) => {
      if (this.edit) {
        this.receiverIds.push(user.player_id);
        formData.append(`player_id`, user.id);
        formData.append(`team_id`, this.teamId);
        const formattedStartDate = moment(this.startDate.value).format('YYYY-MM-DD');
        formData.append(`join_date`, formattedStartDate);
        const formattedEndDate = moment(this.endDate.value).format('YYYY-MM-DD');
        formData.append(`end_date`, formattedEndDate);
        // formData.append(`end_date`, this.noEndDate ? '' : this.endDate || '');
        formData.append(`no_end_date`, this.noEndDate ? '1' : '0');
        formData.append(`no_end_date`, this.noEndDate ? '1' : '0');
        formData.append(`jersey_number`, user.jersey_number);
      } else {
        this.receiverIds.push(user.id);
        formData.append(`players[${i}][player_id]`, user.id);
        formData.append(`players[${i}][team_id]`, this.teamId);
        const formattedStartDate = moment(this.startDate.value).format('YYYY-MM-DD');
        formData.append(`players[${i}][join_date]`, formattedStartDate);

        const formattedEndDate = moment(this.endDate.value).format('YYYY-MM-DD');
        formData.append(`players[${i}][end_date]`, this.noEndDate ? '' : formattedEndDate || '');
        formData.append(`players[${i}][jersey_number]`, user.jersey_number);
      }
      i += 1;
    });

    if (!this.startDate) {
      return;
    }

    if (!this.noEndDate && !this.endDate) {
      return;
    }

    if (this.edit) {
      this.updatePlayer(formData);
    } else {

      this.addPlayer(formData);
    }
  }

  addPlayer(formData: FormData) {
    this.clubService.addTeamPlayer(formData).subscribe((response) => {
      if (response && response.status) {
        let jsonData = localStorage.getItem("userData");
        let myUserId: any;
        if (jsonData) {
          let userData = JSON.parse(jsonData);
          myUserId = userData.id;
        }
        else {
          console.log("No data found in localStorage.");
        }
        console.log("working", this.receiverIds)

        this.receiverIds.forEach((receiverId: any) => {
          console.log("working", receiverId)
          this.socketService.emit('ClubAddPlayer', { senderIds: { senderId: myUserId, teamName: this.teamName }, receiverId: receiverId });
        })
        this.receiverIds = [];

        this.dialogRef.close({
          action: 'added',
          id: this.sightId,
          message: response.message
        });


      } else {
        console.error('Invalid API response structure:', response);
      }
    });
  }

  updatePlayer(formData: FormData) {
    this.clubService.updateTeamPlayer(this.player.id, formData).subscribe((response) => {
      if (response && response.status) {
        let jsonData = localStorage.getItem("userData");
        let myUserId: any;
        if (jsonData) {
          let userData = JSON.parse(jsonData);
          myUserId = userData.id;
        }
        else {
          console.log("No data found in localStorage.");
        }
        console.log("working", this.receiverIds)

        this.receiverIds.forEach((receiverId: any) => {
          console.log("working", receiverId, myUserId)
          this.socketService.emit('ClubAddPlayer', { senderIds: { senderId: myUserId, teamName: this.teamName }, receiverId: receiverId });
        })
        this.receiverIds = [];

        this.dialogRef.close({
          action: 'updated',
          id: this.player.id,
          message: response.message
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
