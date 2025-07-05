import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChangeDetectionStrategy, computed, inject, model, signal } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { UserService } from '../../../services/user.service';
import { TalentService } from '../../../services/talent.service';
import { ScoutService } from '../../../services/scout.service';
import { SocketService } from '../../../services/socket.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-invite-scout-talent-popup',
  templateUrl: './invite-scout-talent-popup.component.html',
  styleUrl: './invite-scout-talent-popup.component.scss'
})
export class InviteScoutTalentPopupComponent {
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly announcer = inject(LiveAnnouncer);
  filteredUsers: any = [];
  users: any = [];
  allUsers: any = [];
  @ViewChild("userInput") userInput!: ElementRef;
  action: any = "";
  invitedUsers: any = [];
  eventName: any = "";
  scoutId: any = "";
  pleaseWait: string = '';
  userSearch: string = '';
  constructor(
    private userService: UserService,
    private scoutService: ScoutService,
    public dialogRef: MatDialogRef<InviteScoutTalentPopupComponent>,
    private socketService: SocketService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translateService: TranslateService,
    private toastr: ToastrService,
  ) {
    this.scoutId = data.scoutId;
  }

  theme: any = localStorage.getItem('theme');

  ngOnInit(): void {
    this.theme = localStorage.getItem('theme');
    this.fetchPlayers();
    this.getToasterMsg();
  }
  isLoading: boolean = true;
  async fetchPlayers(): Promise<void> {
    // try {
    //   this.scoutService.getAllPlayers().subscribe((response) => {
    //     if (response && response.status && response.data && response.data.userData) {
    //       this.allUsers = response?.data?.userData?.users;
    //     } else {
    //       console.error('Invalid API response structure:', response);
    //     }
    //   });
    // } catch (error) {
    //   console.error('Error fetching users:', error);
    // }

    this.isLoading = true;
    let customFilter = this.userSearch + '&whereClasue[role]=4';
    this.userService.exploreSearchUser(customFilter).subscribe((response: any) => {
      if (response && response.status && response.data && response.data.userData) {
        this.allUsers = response.data.userData.users;
      } else {
        this.allUsers = [];
        console.error('Invalid API response structure:', response);
      }
      this.isLoading = false;
    })
  }

  close() {
    this.dialogRef.close();
  }

  sendInvite() {
    // this.toastr.info(this.pleaseWait);
    const toastRef = this.toastr.info(this.pleaseWait, '', {
      disableTimeOut: true, // Don't auto close
      tapToDismiss: false,  // Optional: don't dismiss on click
      closeButton: true     // Optional: show close button
    });
    const formData = new FormData();
    let x = 0;
    let receiverIds: any[] = [];
    this.users.map(function (user: any) {
      formData.append('players[' + x + '][player_id]', user.id);
      receiverIds.push(user.id)
      x++;
    });

    let langId: any = localStorage.getItem('lang_id');

    formData.append('lang', langId);

    this.scoutService.sendScoutPortfolioInvite(this.scoutId, formData).subscribe((response) => {
      this.toastr.clear(toastRef.toastId);
      if (response && response.status) {
        console.log(this.scoutId)
        receiverIds.forEach((id: any) => {
          console.log(this.scoutId, response.data.playerAdded, "check id here")
          this.socketService.emit("scoutAddPlayer", { senderId: this.scoutId, receiverIds: response.data.playerAdded })
        });
        this.dialogRef.close({
          action: 'added',
          id: this.scoutId,
          message: response.message
        });
      } else {
        console.error('Invalid API response structure:', response);
      }

    });
  }

  onKeyPress(event: any) {
    let keyword = event.target.value;
    this.userSearch = keyword;
    console.log(keyword); // You can use this to see the current input value
    if (!keyword) {
      this.userSearch = '';
      return;
    }

    // this.filteredUsers = this.allUsers.filter((user: any) => (user.first_name !== null && user.first_name !== undefined) &&
    //   user.first_name.toLowerCase().indexOf(keyword.toLowerCase()) != -1);
    this.filteredUsers = this.allUsers.filter((user: any) => {
      const firstNameMatch = user.first_name && user.first_name.toLowerCase().startsWith(keyword.toLowerCase());
      const lastNameMatch = user.last_name && user.last_name.toLowerCase().startsWith(keyword.toLowerCase());

      return (firstNameMatch || lastNameMatch);
    });
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
  getToasterMsg() {
    this.translateService.get(['pleaseWait']).subscribe((translations) => {
      this.pleaseWait = translations['pleaseWait'];
    });
  }
}
