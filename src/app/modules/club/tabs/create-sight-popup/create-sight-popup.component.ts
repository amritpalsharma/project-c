import { Component, AfterViewInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, computed, inject, model, signal } from '@angular/core';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { UserService } from '../../../../services/user.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ClubService } from '../../../../services/club.service';
import { SocketService } from '../../../../services/socket.service';

@Component({
  selector: 'app-create-sight-popup',
  templateUrl: './create-sight-popup.component.html',
  styleUrls: ['./create-sight-popup.component.scss']
})
export class CreateSightPopupComponent implements AfterViewInit {

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly announcer = inject(LiveAnnouncer);
  filteredUsers: any = [];
  users: any = [];
  allUsers: any = [];
  hideInviteeOverlay: boolean = true;
  @ViewChild("userInput") userInput!: ElementRef;
  defaultDate: any = "";
  idToBeUpdate: any = "";
  eventName: any = "";
  managerName: any = "";
  date: any = "";
  address: any = "";
  zipcode: any = "";
  city: any = "";
  about: any = "";
  bannerFile: any = "";
  clubId: any = '';
  dateTime: any = "";
  attachmentRows: any = [{
    title: "",
    file: ""
  }];
  @ViewChild('fileInput', { static: false }) fileInputElement!: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<CreateSightPopupComponent>,
    public userService: UserService,
    public clubService: ClubService,
    private socketService: SocketService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.clubId = data.clubId;

    if (data.sightData) {
      this.eventName = data.sightData.event_name;
      this.managerName = data.sightData.manager_name;
      this.date = data.sightData.event_date;
      this.dateTime = this.reverseDateFormat(data.sightData.event_date, data.sightData.event_time);
      this.address = data.sightData.address;
      this.zipcode = data.sightData.zipcode;
      this.city = data.sightData.city;
      this.about = data.sightData.about_event;
      this.idToBeUpdate = data.sightData.id;
    }
  }

  ngAfterViewInit() {
  }

  ngOnInit(): void {
    try {
      this.clubService.getAllPlayers().subscribe((response) => {
        if (response && response.status && response.data && response.data.userData) {
          this.allUsers = response.data.userData.users;
          console.log(this.allUsers)
          if (this.data.invitees) {
            let tempInvitees: any = [];
            this.data.invitees.map((i: any) => {
              let index = this.allUsers.findIndex((x: any) => i.user_id == x.id);
              if (index >= 0) {
                tempInvitees.push(this.allUsers[index]);
              }
            })
            this.users = tempInvitees;
          }
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

  toggleInviteeOverlay() {
    if (this.hideInviteeOverlay) {
      this.hideInviteeOverlay = false;
    } else {
      this.hideInviteeOverlay = true;
    }
  }

  onBannerFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.bannerFile = input.files[0];
    }
  }

  onAttachmentFileChange(event: Event, index: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.attachmentRows[index].file = input.files[0];
    }
  }

  titleUpdate(event: any, index: any) {
    let value = event.target.value;
    this.attachmentRows[index].title = value;
  }

  addNewRow() {
    this.attachmentRows.push({
      title: "",
      file: ""
    });
  }

  removeRow(index: any): any {
    if (this.attachmentRows.length == 1) {
      return false;
    }
    let temp = this.attachmentRows;
    temp.splice(index, 1);
    this.attachmentRows = temp;
  }

  callListApi(userInput: HTMLInputElement) {
    setTimeout(() => {
      this.filteredUsers = this.allUsers.filter((user: any) => (user.first_name !== null && user.first_name !== undefined) &&
        user.first_name.toLowerCase().indexOf(userInput.value.toLowerCase()) != -1
      );
    }, 2000);
    console.log(userInput.value);
  }

  onKeyPress(event: any) {
    let keyword = event.target.value;
    console.log(keyword); // You can use this to see the current input value

    this.filteredUsers = this.allUsers.filter((user: any) => (user.first_name !== null && user.first_name !== undefined) &&
      user.first_name.toLowerCase().indexOf(keyword.toLowerCase()) != -1);
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

  sendInvite() {
    this.hideInviteeOverlay = true;
  }

  formatDate(dateTime: any) {
    const year = dateTime.getFullYear();
    const month = String(dateTime.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(dateTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  reverseDateFormat(date: any, time: any) {
    let dateArr = date.split('-');
    return `${dateArr[1]}-${dateArr[2]}-${dateArr[0]} ${time}`;
  }

  getDateTimeFormat(dateTimeString: any) {
    let arr = dateTimeString.split('T');
    let dateArr = arr[0].split('-');
    let time = arr[1];

    const formattedDate = `${dateArr[0]}-${dateArr[1]}-${dateArr[2]}`;
    return {
      date: formattedDate,
      time: time
    };
  }

  createSight() {
    const formData = new FormData();
    let { date, time } = this.getDateTimeFormat(this.dateTime);
    let receiverIds : any[] = [];

    formData.append('event_name', this.eventName);
    formData.append('manager_name', this.managerName);
    formData.append('event_date', date);
    formData.append('event_time', time);
    formData.append('address', this.address);
    formData.append('zipcode', this.zipcode);
    formData.append('city', this.city);
    formData.append('about_event', this.about);
    formData.append('banner', this.bannerFile);

    this.attachmentRows.map(function (attachment: any, index: any) {
      formData.append('attachments[' + index + '][title]', attachment.title);
      formData.append('attachments[' + index + '][file]', attachment.file);
    });

    this.users.map(function (user: any) {
      formData.append('invites[]', user.id);
      receiverIds.push(user.id);
      // console.log(receiverIds);
    });


    try {
      this.clubService.addSight(this.clubId, formData).subscribe((response) => {
        console.log(this.clubId)
        if (response && response.status) {
          this.dialogRef.close({
            action: 'added'
          })

          let jsonData = localStorage.getItem("userData");
          let myUserId: any;
          if (jsonData) {
            let userData = JSON.parse(jsonData);
            myUserId = userData.id;
          }
          else {
            console.log("No data found in localStorage.");
          }
          this.socketService.emit('inviteTalent', {senderId: myUserId, receiverIds: receiverIds});
        } else {
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }

  updateSight() {
    const formData = new FormData();
    let { date, time } = this.getDateTimeFormat(this.dateTime);
    formData.append('event_name', this.eventName);
    formData.append('manager_name', this.managerName);
    formData.append('event_date', date);
    formData.append('event_time', time);
    formData.append('address', this.address);
    formData.append('zipcode', this.zipcode);
    formData.append('city', this.city);
    formData.append('about_event', this.about);

    if (this.bannerFile != "") {
      formData.append('banner', this.bannerFile);
    }

    this.users.map(function (user: any) {
      formData.append('invites[]', user.id);
    });

    try {
      this.clubService.updateSight(this.idToBeUpdate, formData).subscribe((response) => {
        console.log(response)
        if (response && response.status) {
          this.dialogRef.close({
            action: 'updated',
            id: this.idToBeUpdate
          })
        } else {
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }
}
