import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChangeDetectionStrategy, computed, inject, model, signal } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { UserService } from '../../../../services/user.service';
import { TalentService } from '../../../../services/talent.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { debounceTime, Subject } from 'rxjs';
// import { PortfolioTabComponent } from '../portfolio-tab/portfolio-tab.component';


@Component({
  selector: 'app-invite-scout-talent-popup',
  templateUrl: './invite-scout-talent-popup.component.html',
  styleUrl: './invite-scout-talent-popup.component.scss'
})
export class InviteScoutTalentPopupComponent {

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly announcer = inject(LiveAnnouncer);
  searchSubject = new Subject<string>();
  filteredUsers: any = [];
  users: any = [];
  allUsers: any = [];
  @ViewChild("userInput") userInput!: ElementRef;
  action: any = "";
  invitedUsers: any = [];
  eventName: any = "";
  scoutId: any = "";
  theme: string = localStorage.getItem('theme') || 'dark';
  currentSearch: string = '';
  constructor(
    // private portfolioTab: PortfolioTabComponent,
    private userService: UserService,
    private talentService: TalentService,
    public dialogRef: MatDialogRef<InviteScoutTalentPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(data);
    this.scoutId = data.scoutId;

    this.searchSubject.pipe(debounceTime(300)).subscribe(keyword => {
      if (keyword.length < 2) {
        this.filteredUsers = [];
        this.currentSearch = '';
        return;
      }
      this.currentSearch = keyword;
      // this.filteredUsers = this.allUsers.filter((user: any) => {
      //   let firstName = user.first_name ? user.first_name.toLowerCase() : '';
      //   let lastName = user.last_name ? user.last_name.toLowerCase() : '';

      //   return firstName.includes(keyword) || lastName.includes(keyword);
      // });
      this.filteredUsers = this.allUsers.filter((user: any) => {
        const fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.toLowerCase().trim();
        return fullName.includes(keyword.toLowerCase());
      });
    });
  }

  ngOnInit(): void {
    this.fetchPlayers();
  }

  async fetchPlayers(): Promise<void> {
    try {
      this.userService.getAllPlayers().subscribe((response) => {
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

  sendInvite() {
    const formData = new FormData();
    let x = 0;
    this.users.map(function (user: any) {
      formData.append('players[' + x + '][player_id]', user.id);
      x++;
    });
    let lang_id = localStorage.getItem('lang_id');
    formData.append('lang', lang_id + '');

    this.userService.sendScoutPortfolioInvite(this.scoutId, formData).subscribe((response) => {
      if (response && response.status) {
        this.dialogRef.close({
          action: 'added',
          id: this.scoutId,
          message: response.message
        });
        // this.portfolioTab.getScoutPlayers();
      } else {
        console.error('Invalid API response structure:', response);
      }
    });
  }

  onKeyPress(event: any) {
    let keyword = event.target.value;

    keyword = keyword.toLowerCase();
    // console.log(keyword); // You can use this to see the current input value
    if (keyword.length < 2) {
      this.filteredUsers = [];
      this.currentSearch = '';
      return;
    }
    // this.filteredUsers = this.allUsers.filter((user: any) => (user.first_name !== null && user.first_name !== undefined) &&
    //   user.first_name.toLowerCase().indexOf(keyword.toLowerCase()) != -1);
    this.filteredUsers = this.allUsers.filter((user: any) => {
      const fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.toLowerCase().trim();
      return fullName.includes(keyword.toLowerCase());
    });
  }

  onClickOutside() {
    this.dialogRef.close();
  }

  // callListApi(userInput: HTMLInputElement) {
  //   setTimeout(() => {
  //     this.filteredUsers = this.allUsers.filter((user:any) => (user.first_name !== null && user.first_name !== undefined)  && 
  //     user.first_name.toLowerCase().indexOf(userInput.value.toLowerCase()) != -1
  //     );
  //   }, 500);
  //   console.log(userInput.value);
  // }

  callListApi(userInput: HTMLInputElement) {
    const keyword = userInput.value.trim().toLowerCase(); // Trim spaces and convert to lowercase
    if (keyword.length < 2) {
      this.filteredUsers = [];
      this.currentSearch = '';
      return;
    }
    this.searchSubject.next(keyword); // Send input to debounce stream
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
