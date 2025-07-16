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
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { FormControl } from '@angular/forms';

declare var flatpickr: any;

@Component({
  selector: 'app-create-sight-popup',
  templateUrl: './create-sight-popup.component.html',
  styleUrls: ['./create-sight-popup.component.scss'],
  providers: [DatePipe]
})
export class CreateSightPopupComponent implements AfterViewInit {
  @ViewChild('dateInput', { static: true }) dateInput!: ElementRef;
  pickerInstance: any;

  @ViewChild('dateInput2', { static: true }) dateInput2!: ElementRef;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly announcer = inject(LiveAnnouncer);
  theme: string = localStorage.getItem('theme') || 'light';
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
  isLoading: boolean = false;
  status: boolean = true;


  uploadedBannerImage: boolean = false;
  bannerImageName: string = '';
  deleteImage: string = '';

  submitButtonClicked: boolean = false;
  @ViewChild('fileInput', { static: false }) fileInputElement!: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<CreateSightPopupComponent>,
    public userService: UserService,
    public clubService: ClubService,
    public toaster: ToastrService,
    private socketService: SocketService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.clubId = data.clubId;

    if (data.sightData) {
      console.log(data.sightData);
      this.eventName = data.sightData.event_name;
      this.managerName = data.sightData.manager_name;
      this.date = data.sightData.event_date;
      this.dateTime = this.reverseDateFormat(data.sightData.event_date, data.sightData.event_time);
      // console.log('this.dateTime', this.dateTime)
      this.address = data.sightData.address;
      this.zipcode = data.sightData.zipcode;
      this.city = data.sightData.city;
      this.about = data.sightData.about_event;
      this.idToBeUpdate = data.sightData.id;
      this.status = data.sightData.status === 'active' ? true : false;
      // this.dateTime = this.formatDateForInput(new Date());
      // this.dateTime = `${this.date}T${data.sightData.event_time}`;

      // this.showImageFromUrl(data.sightData.banner_path, 'Banner Image');
      this.bannerImageName = data.sightData.banner;
      setTimeout(() => {
        this.showImageFromUrl(data.sightData.banner_path, 'Existing Banner');
      });


      const event_date = data.sightData.event_date;
      const event_time = data.sightData.event_time;
      const [year, month, day] = event_date.split('-').map(Number);
      const [hour, minute] = event_time.split(':').map(Number);
      this.dateTime = new Date(year, month - 1, day, hour, minute); // ✅ JavaScript months are 0-based
      this.dateControl.setValue(this.dateTime); // For <mat-datepicker>
      this.timeString = event_time;             // For <input type="time">
    }
  }

  formatDateForInput(date: Date): string {
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  @ViewChild('numInput', { static: false }) numInput!: ElementRef;

  ngAfterViewInit() {
    this.numInput.nativeElement.addEventListener('wheel', (event: WheelEvent) => {
      event.preventDefault();
    });

    // this.pickerInstance = flatpickr(this.dateInput.nativeElement, {
    //   enableTime: true,
    //   dateFormat: "d.m.Y H:i",
    //   time_24hr: true
    // });
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
      const file = this.bannerFile;
      console.info(file);
      const h5Element = document.createElement('h5');
      h5Element.innerText = file.name;
      this.uploadedBannerImage = true;
      const reader = new FileReader();
      // This function runs when the file is successfully read
      reader.onload = (e) => {
        const imgElement = document.createElement('img');
        imgElement.src = e.target?.result as string;  // Get the base64-encoded string from FileReader
        imgElement.alt = file.name;                   // Alt text for the image
        // Optionally, add the image to a specific container in your HTML
        const previewContainer = document.getElementById('imagePreviewContainer');
        if (previewContainer) {
          previewContainer.innerHTML = '';  // Clear any previous previews
          previewContainer.appendChild(imgElement);  // Append the new image
          // previewContainer.appendChild(h5Element);  // Append the Name image
        }
      };
      reader.readAsDataURL(file);
      // this.uploadedBannerImage.sizeInMB = sizeInMB;
    }
  }

  showImageFromUrl(imageUrl: string, imageName: string = 'Uploaded Image'): void {
    // this.bannerFile = imageName;
    this.uploadedBannerImage = true;
    console.log(imageUrl, 'image')
    const imgElement = document.createElement('img');
    imgElement.src = imageUrl;
    imgElement.alt = imageName;

    const previewContainer: any = document.getElementById('imagePreviewContainer');
    // if (previewContainer) {
    previewContainer.innerHTML = '';  // Clear existing content
    previewContainer.appendChild(imgElement);

    // Optional: Show image name
    // const h5Element = document.createElement('h5');
    // h5Element.innerText = imageName;
    // previewContainer.appendChild(h5Element);
    // }
  }


  removeImage(action: string) {
    this.bannerFile = [];
    this.uploadedBannerImage = false;
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    if (imagePreviewContainer) {
      imagePreviewContainer.innerHTML = '';  // Clear any previous previews
    }
    if (action === 'yes') {
      this.deleteImage = this.bannerImageName;
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

  removeFile(index: any) {
    if (this.attachmentRows.length > 0) {
      this.attachmentRows[index].file = '';
    }
  }

  removeRow(index: any): any {
    if (this.attachmentRows.length == 1) {
      this.attachmentRows[index].title = null;
      this.attachmentRows[index].file = null;
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

  getDateTimeFormat111(dateTimeString: any) {
    let arr = dateTimeString.split('T');
    let dateArr = arr[0].split('-');
    let time = arr[1];

    const formattedDate = `${dateArr[0]}-${dateArr[1]}-${dateArr[2]}`;
    return {
      date: formattedDate,
      time: time
    };
  }

  // getDateTimeFormat(dateTimeValue: any) {
  //   // Ensure we are working with a string
  //   let isoString = '';

  //   if (dateTimeValue instanceof Date) {
  //     isoString = dateTimeValue.toISOString(); // "2025-07-23T09:15:00.000Z"
  //   } else if (typeof dateTimeValue === 'string') {
  //     isoString = dateTimeValue;
  //   } else {
  //     return { date: '', time: '' }; // fallback for invalid input
  //   }

  //   let arr = isoString.split('T');
  //   let dateArr = arr[0].split('-');
  //   let time = arr[1]?.slice(0, 5); // only HH:mm

  //   const formattedDate = `${dateArr[0]}-${dateArr[1]}-${dateArr[2]}`;
  //   return {
  //     date: formattedDate,
  //     time: time
  //   };
  // }


  getDateTimeFormat(dateTimeValue: any) {
    if (!dateTimeValue) {
      return { date: '', time: '' };
    }

    let dateObj: Date;

    if (typeof dateTimeValue === 'string') {
      dateObj = new Date(dateTimeValue);
    } else if (dateTimeValue instanceof Date) {
      dateObj = dateTimeValue;
    } else {
      return { date: '', time: '' };
    }

    // Extract local date and time
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // 0-indexed
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');

    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`
    };
  }


  createSight() {
    console.info('this.dateTime', this.dateTime)
    this.isLoading = true;
    // alert('done');
    // return;
    this.submitButtonClicked = true;
    const formData = new FormData();

    if (!this.timeString) {
      this.isLoading = false;
      return;
    }
    let { date, time } = this.getDateTimeFormat(this.dateTime);

    console.info(time);
    let receiverIds: any[] = [];

    formData.append('event_name', this.eventName);
    formData.append('manager_name', this.managerName);
    formData.append('event_date', date);
    formData.append('event_time', time);
    formData.append('address', this.address);
    formData.append('zipcode', this.zipcode);
    formData.append('city', this.city);
    formData.append('about_event', this.about);
    formData.append('banner', this.bannerFile);

    if (this.status) {
      formData.append('status', 'active');
    }
    else {
      formData.append('status', 'inactive');
    }

    let langId: any = localStorage.getItem('lang_id');

    formData.append('lang', langId);

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
        console.log(this.clubId, receiverIds)
        if (response && response.status) {
          this.dialogRef.close({
            action: 'added',
            // message: response.message
          })
          this.toaster.success(response.message);
          let jsonData = localStorage.getItem("userData");
          let myUserId: any;
          if (jsonData) {
            let userData = JSON.parse(jsonData);
            myUserId = userData.id;
          }
          else {
            console.log("No data found in localStorage.");
          }
          this.socketService.emit('inviteTalent', { senderId: myUserId, receiverIds: receiverIds, eventId: response.data.event_id });
          this.isLoading = false;
        } else {
          if (response.data.errors && response.data.errors != '' && response.data.errors != undefined) {
            if (response.data.file_errors && this.uploadedBannerImage) {
              this.toaster.error(response.data.file_errors);
            } else {
              this.toaster.error(response.data.errors);
            }
          } else {
            this.userService.apiToasterError();
          }
          this.isLoading = false;
        }
      });
    } catch (error) {
      this.userService.apiToasterError();
      this.isLoading = false;
    }


  }

  updateSight() {
    this.isLoading = true;
    // this.submitButtonClicked = true;
    if (!this.timeString) {
      this.isLoading = false;
      return;
    }
    const formData = new FormData();
    console.log('this.dateTime', this.dateTime)
    let { date, time } = this.getDateTimeFormat(this.dateTime);
    console.info('time', time);
    // this.isLoading = false;
    // return;
    formData.append('event_name', this.eventName);
    formData.append('manager_name', this.managerName);
    formData.append('event_date', date);
    formData.append('event_time', time);
    formData.append('address', this.address);
    formData.append('zipcode', this.zipcode);
    formData.append('city', this.city);
    formData.append('about_event', this.about);
    if (this.deleteImage) {
      formData.append('delete_banner', this.deleteImage);
    }

    if (this.bannerFile != "") {
      formData.append('banner', this.bannerFile);
    }

    if (this.status) {
      formData.append('status', 'active');
    }
    else {
      formData.append('status', 'inactive');
    }

    this.users.map(function (user: any) {
      formData.append('invites[]', user.id);
    });
    let langId: any = localStorage.getItem('lang_id');

    formData.append('lang', langId);
    try {
      this.clubService.updateSight(this.idToBeUpdate, formData).subscribe((response) => {
        console.log(response)
        if (response && response.status) {
          this.dialogRef.close({
            action: 'updated',
            id: this.idToBeUpdate,
            message: response.message
          })
          this.isLoading = false;
        } else {
          this.userService.apiToastError(response.data.errors);
          this.isLoading = false;
        }
      });
    } catch (error) {
      this.userService.apiToasterError();
      this.isLoading = false;
    }
  }

  removeMP4(str: string) {
    let textToRemove = 'MP4';
    const regex = new RegExp(`,?\\s*${textToRemove}`, 'gi');
    return str.replace(regex, '').trim();
    // return str;
  }




  isDragOver: boolean = false;
  isUnsupportedFile: boolean = false;
  // isFileTooLarge: boolean = false;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    // this.isDragOver = true;

    const items = event.dataTransfer?.items;
    if (items && items.length > 0) {
      const fileType = items[0].type;
      const validTypes = ['image/png', 'image/jpeg'];
      this.isUnsupportedFile = !validTypes.includes(fileType);
      this.isDragOver = validTypes.includes(fileType);
    }
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    this.isUnsupportedFile = false;
  }

  // onDrop(event: DragEvent) {
  //   event.preventDefault();
  //   this.isDragOver = false;

  //   const files = event.dataTransfer?.files;
  //   if (files && files.length > 0) {
  //     const fileList: FileList = files;
  //     const fakeEvent = {
  //       target: {
  //         files: fileList
  //       }
  //     } as unknown as Event;

  //     this.onBannerFileChange(fakeEvent);
  //   }
  // }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    this.isUnsupportedFile = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Validate file type
      const validTypes = ['image/png', 'image/jpeg'];
      if (!validTypes.includes(file.type)) {
        // this.showMatDialog('Only PNG and JPG files are allowed.', 'display'); // optional feedback
        return;
      }


      const maxSizeMB = 5;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      // if (file.size > maxSizeBytes) {
      //   this.isFileTooLarge = true;
      //   return;
      // }

      // Simulate the file input change event
      const fakeEvent = {
        target: {
          files: [file]
        }
      } as unknown as Event;

      this.onBannerFileChange(fakeEvent);
    }
  }


  onDateInput(): void {
    let value = this.date.replace(/[^\d]/g, '').slice(0, 8); // Only digits, limit to 8 digits for DDMMYYYY
    if (value.length >= 2) value = value.slice(0, 2) + '.' + value.slice(2);
    if (value.length >= 5) value = value.slice(0, 5) + '.' + value.slice(5);
    if (value.length > 10) value = value.slice(0, 10);
    this.date = value;
  }


  ngOnDestroy(): void {
    if (this.pickerInstance) {
      this.pickerInstance.destroy();
    }
  }

  combineDateTime(date: Date, time: string): Date {
    if (time) {
      const [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
      date.setHours(hours);
      date.setMinutes(minutes);
    }
    return date;
  }
  time: string = '';
  onDateChange(event: MatDatepickerInputEvent<Date>) {
    const selectedDate: Date | null = event.value;  // Ensure it is either Date or null
    if (selectedDate) {
      const combinedDateTime = this.combineDateTime(selectedDate, this.time);
      this.dateTime.setValue(combinedDateTime);  // Combine and store
    } else {
      this.dateTime.setValue(null);  // If no date is selected, set null
    }
  }


  dateTimeNew: Date | null = null;
  dateControl = new FormControl(); // Just for binding to mat-datepicker

  timeString: string = '';
  // When user selects date
  onDateChange1(event: any) {
    console.info('this.timeString', this.timeString)
    const selectedDate = event.value;
    if (selectedDate) {
      // const time = selectedDate ? selectedDate.split(':') : ['00', '00'];
      const time = this.timeString ? this.timeString.split(':') : ['00', '00'];
      const hours = parseInt(time[0], 10);
      const minutes = parseInt(time[1], 10);
      this.dateTime = new Date(selectedDate);
      this.dateTime.setHours(hours, minutes);
    }

    console.info('this.dateTime', this.dateTime)
  }

  // When user selects time
  // onTimeChange1(event: any) {
  //   this.timeString = event.target.value;
  //   if (this.dateControl.value) {
  //     const [hours, minutes] = this.timeString.split(':').map(Number);
  //     this.dateTimeNew = new Date(this.dateControl.value);
  //     this.dateTimeNew.setHours(hours, minutes);
  //   }
  //   console.info('Time is updated current time is ',this.timeString)
  //   console.info('this.dateControl.value',this.dateControl.value);
  //   console.info('this.dateTime', this.dateTime)
  // }
  onTimeChange1(event: any) {
    this.timeString = event.target.value;
    if (this.dateControl.value) {
      const [hours, minutes] = this.timeString.split(':').map(Number);
      this.dateTimeNew = new Date(this.dateControl.value);
      this.dateTimeNew.setHours(hours, minutes);

      // ✅ Update dateTime with the new value
      this.dateTime = new Date(this.dateTimeNew);
    }

    console.info('Time is updated current time is ', this.timeString);
    console.info('this.dateControl.value', this.dateControl.value);
    console.info('this.dateTime', this.dateTime); // ✅ Now reflects updated time
  }

}
