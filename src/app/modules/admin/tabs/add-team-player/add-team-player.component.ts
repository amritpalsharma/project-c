import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { inject } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { UserService } from '../../../../services/user.service';
// import { userService } from '../../../../services/user.service';
import { SocketService } from '../../../../services/socket.service';
import { FormControl, NgForm } from '@angular/forms';
import * as _moment from 'moment';
import { MatDatepickerInputEvent, MatDatepicker } from '@angular/material/datepicker';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';
import { ToastrService } from 'ngx-toastr';

const moment = _rollupMoment || _moment;

@Component({
  selector: 'app-add-team-player',
  templateUrl: './add-team-player.component.html',
  styleUrl: './add-team-player.component.scss'
})
export class AddTeamPlayerComponent implements OnInit {

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
  startDate: FormControl = new FormControl(null);
  endDate: FormControl = new FormControl(null);
  noEndDate: boolean = false;
  teamId: any;
  player: any;
  edit: boolean = false;
  teamName: string = '';
  baseUrl: string = 'https://api.socceryou.ch/uploads/';
  theme: string = localStorage.getItem('theme') || 'light';
  submitClicked: boolean = false;

  jerseyNumber: string = '';
  teamGroup: string = 'w';

  startDateTime = new FormControl();


  userID: string = '';
  constructor(
    // private clubService: ClubService,
    public dialogRef: MatDialogRef<AddTeamPlayerComponent>,
    private socketService: SocketService,
    public toaster: ToastrService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data?.user_id) {
      this.userID = this.data?.user_id;
    }
    if (this.data?.teamId) {
      this.teamId = this.data?.teamId;
    }

    if (this.data?.edit) {
      this.edit = true;
      this.player = data.player;
      this.jerseyNumber = data.player.jersey_number;
      this.startDate.setValue(this.player.join_date ? new Date(this.player.join_date) : null);
    }

    // console.log(data);
    // this.teamId = data.teamId;
    // this.player = data.player;
    // this.edit = data.edit;
    // this.teamGroup = data.team_group;
    // this.teamName = data.teamName;
    // this.jerseyNumber = data.player.jersey_number;

    // this.startDate.setValue(this.player.join_date ? new Date(this.player.join_date) : null);
  }

  ngOnInit(): void {
    if (!this.edit) {
      this.fetchPlayers('');
    }
    if (this.edit && this.player) {
      this.initializeFormFields();
    }
  }

  initializeFormFields(): void {
    // this.startDate = this.player.join_date;
    this.startDate.setValue(this.player.join_date ? new Date(this.player.join_date) : null);
    this.startDate = new FormControl(
      this.player.join_date ? new Date(this.player.join_date) : null
    );

    this.endDate = new FormControl(
      this.player.end_date ? new Date(this.player.end_date) : null
    );
    this.noEndDate = this.player.no_end_date === '1';
    this.users = [this.player]; // Assuming you want to pre-fill the user
  }

  async fetchPlayers(keyword: string): Promise<void> {
    this.userSearch = keyword;
    // if (!keyword || keyword.length <= 0) {
    //   this.filteredUsers = [];
    //   this.userSearch = '';
    //   return;
    // }
    // if (keyword && keyword.length > 1) {
    // } else {
    //   this.filteredUsers = [];
    //   return;
    // }

    try {
      this.userService.getAllPlayers().subscribe((response: any) => {
        // this.clubService.getAllPlayers().subscribe((response) => {
        if (response && response.status && response.data && response.data.userData) {
          this.allUsers = response.data.userData;
          this.filteredUsers = response.data.userData;
          // console.info(this.allUsers)
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

    // if(!this.endDate.value && !this.noEndDate){
    //   return;
    // }
    console.log(this.submitClicked, this.startDate)
    const formData = new FormData();
    let i = 0;
    let lang_id = localStorage.getItem('lang_id');
    formData.append(`lang`, lang_id + '');
    console.log(this.users);
    // return
    this.users.map((user: any) => {
      if (this.edit) {
        // this.receiverIds.push(user.player_id);
        formData.append(`player_id`, user.id);
        formData.append(`team_id`, this.teamId);
        const formattedStartDate = moment(this.startDate.value).format('YYYY-MM-DD');
        formData.append(`join_date`, formattedStartDate);
        const formattedEndDate = this.endDate.value ? moment(this.endDate.value).format('YYYY-MM-DD') : '';
        // formData.append(`end_date`, formattedEndDate);
        // formData.append(`no_end_date`, this.noEndDate ? '1' : '0');

        if (this.noEndDate) {
          formData.append(`no_end_date`, this.noEndDate ? '1' : '0');
        }
        else {
          formData.append(`end_date`, this.noEndDate ? '' : formattedEndDate || '');
        }
        formData.append(`jersey_number`, user.jersey_number ? user.jersey_number : '');
      } else {
        // this.receiverIds.push(user.id);
        formData.append(`players[${i}][player_id]`, user.id);
        formData.append(`players[${i}][team_id]`, this.teamId);
        const formattedStartDate = moment(this.startDate.value).format('YYYY-MM-DD');
        formData.append(`players[${i}][join_date]`, formattedStartDate);

        const formattedEndDate = this.endDate.value ? moment(this.endDate.value).format('YYYY-MM-DD') : '';
        if (this.noEndDate) {
          formData.append(`players[${i}][no_end_date]`, this.noEndDate ? '1' : '0');
        }
        else {
          formData.append(`players[${i}][end_date]`, this.noEndDate ? '' : formattedEndDate || '');
        }
        formData.append(`players[${i}][jersey_number]`, user.jersey_number ? user.jersey_number : '');
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

  submitButtonClicked: boolean = false;

  addPlayer(formData: FormData) {
    this.userService.addTeamPlayerAdmin(formData, this.userID).subscribe((response) => {
      this.submitButtonClicked = true;
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
        this.receiverIds = response.data.playerAdded;

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
        // console.error('Invalid API response structure:', response);
        this.toaster.warning(response.data.errors);
      }

      this.submitButtonClicked = false;
    });
  }

  updatePlayer(formData: FormData) {
    this.userService.updateTeamPlayer(this.player.id, formData).subscribe((response) => {
      this.submitButtonClicked = true;
      if (response && response.status) {

        this.dialogRef.close({
          action: 'updated',
          id: this.player.id,
          message: response.message
        });
      } else {
        // console.error('Invalid API response structure:', response);
        this.toaster.warning(response.data.errors);
      }
    });
  }

  userSearch: string = '';

  onKeyPress(event: any) {
    let keyword = event.target.value;
    // console.log('KeyWord : '+keyword+' keyword.length : '+keyword.length); // You can use this to see the current input value

    this.userSearch = keyword;

    // let keyword = event.target.value;

    // this.searchVal = keyword;
    if (!keyword || keyword.length < 1) {
      this.userSearch = '';
    }
    console.log(keyword); // You can use this to see the current input value

    this.filteredUsers = this.allUsers.filter((user: any) => (user.first_name !== null && user.first_name !== undefined) &&
      user.first_name.toLowerCase().indexOf(keyword.toLowerCase()) != -1);


  }

  onClickOutside() {
    this.dialogRef.close();
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

  validateNumber(event: KeyboardEvent): void {
    // Allow backspace, delete, tab, and arrow keys
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];

    if (allowedKeys.includes(event.key)) {
      return;  // Let these keys through
    }

    // If the key is not a digit (0-9), prevent it
    if (!/\d/.test(event.key)) {
      event.preventDefault();
    }

    // Check if the current value contains a decimal point and prevent it
    const value = (event.target as HTMLInputElement).value;
    if (value.includes('.') && event.key === '.') {
      event.preventDefault();  // Prevent entering another decimal point
    }
  }

  openDatePicker(datepicker: MatDatepicker<any>) {
    datepicker.open();  // Opens the date picker
  }

}
