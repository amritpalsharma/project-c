import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChangeDetectionStrategy, computed, inject, model, signal } from '@angular/core';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { UserService } from '../../../../services/user.service';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-inbox-popup',
  templateUrl: './inbox-popup.component.html',
  styleUrls: ['./inbox-popup.component.scss']
})
export class InboxPopupComponent {
  searchSubject = new Subject<string>();
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly announcer = inject(LiveAnnouncer);
  filteredUsers: any = [];
  users: any = [];
  allUsers: any = [];
  theme: any = localStorage.getItem('theme');
  @ViewChild("userInput") userInput!: ElementRef;

  constructor(
    private userService: UserService,
    public dialogRef: MatDialogRef<InboxPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.searchSubject.pipe(debounceTime(300)).subscribe(keyword => {
      this.filteredUsers = this.allUsers.filter((user: any) => {
        let firstName = user.first_name ? user.first_name.toLowerCase() : '';
        let lastName = user.last_name ? user.last_name.toLowerCase() : '';
        return firstName.includes(keyword) || lastName.includes(keyword);
      });
    });
    this.fetchUsers();
  }
  ngOnInit(): void {
    this.theme = localStorage.getItem('theme');
  }

  async fetchUsers(): Promise<void> {
    try {
      const response: any = await this.userService.getUsersAll().toPromise();
      if (response && response.status && response.data && response.data.userData) {
        this.allUsers = response.data.userData;
      } else {
        console.error('Invalid API response structure:', response);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }

  }
  close() {
    this.dialogRef.close();
  }
  startChat() {
    this.dialogRef.close({ data: this.users });
  }

  onClickOutside() {
    this.dialogRef.close();
  }

  callListApiOld(userInput: HTMLInputElement) {
    console.log(this.allUsers, 'getting-all-users');
    const inputValue = userInput.value.toLowerCase();
    setTimeout(() => {
      // this.filteredUsers = this.allUsers.filter((user:any) => (user.first_name !== null && user.first_name !== undefined));
      this.filteredUsers = this.allUsers.filter((user: any) => {
        let makeUsernameIntoLowerCase = user.username.toLowerCase();
        if (user.first_name !== null && user.first_name !== undefined && makeUsernameIntoLowerCase.includes(inputValue)) {
          return user;
        }
      });
    }, 2000);
    // console.log(userInput.value);
  }

  callListApi25March(userInput: HTMLInputElement) {
    if (!this.allUsers || !Array.isArray(this.allUsers)) {
      console.error('User data is not available');
      return;
    }

    const searchText = userInput.value.toLowerCase().trim();
    this.filteredUsers = this.allUsers.filter((user: any) =>
      user.first_name && user.first_name.toLowerCase().includes(searchText)
    );
  }

  callListApi(userInput: HTMLInputElement) {
    const keyword = userInput.value.trim().toLowerCase(); // Trim spaces and convert to lowercase
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
