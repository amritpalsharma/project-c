import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { inject } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { UserService } from '../../../../services/user.service';
import { TalentService } from '../../../../services/talent.service';
import { ChangeDetectorRef } from '@angular/core';

import { Subject, Subscription } from 'rxjs';
import { of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'shared-chat-popup',
  templateUrl: './chat-popup.component.html',
  styleUrls: ['./chat-popup.component.scss']
})

export class ChatPopupComponent {
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly announcer = inject(LiveAnnouncer);
  filteredUsers: any = [];
  users: any = [];
  allUsers: any = [];
  @ViewChild("userInput") userInput!: ElementRef;
  theme: string = localStorage.getItem('theme') || 'light';
  classForAutoList: string = 'd-none';
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | undefined;

  constructor(
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private talentService: TalentService,
    public dialogRef: MatDialogRef<ChatPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    // this.fetchUsers();
    this.theme = localStorage.getItem('theme') + '';

    // New code for search 
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300), // Wait 300ms after user stops typing
      distinctUntilChanged(), // Only emit if the value changed
      switchMap((searchText: string) =>
        this.userService.exploreSearchUser(searchText).pipe(
          catchError((error) => {
            console.error('API Error:', error);
            return of({ status: false, data: { userData: { users: [] } } }); // prevent stream break
          })
        )
      )
    ).subscribe((response: any) => {
      if (response?.status && response.data?.userData?.users) {
        this.allUsers = response.data.userData.users;
        // this.filteredUsers = [...this.allUsers];
        this.filteredUsers = this.allUsers;
      } else {
        this.allUsers = [];
        this.filteredUsers = [];
      }
    });

  }

  ngAfterViewInit() {
    this.classForAutoList = 'd-none';
    this.cdr.detectChanges(); // 🔁 Re-checks after change
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

  startChat() {
    console.warn(this.users)
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
    this.classForAutoList = '';

    const searchText = userInput.value.toLowerCase().trim();
    if (!searchText) {
      this.classForAutoList = 'd-none';
    }

    // 01-07-2025
    // this.filteredUsers = this.allUsers.filter((user: any) => {
    //   // Ensure both first and last name exist
    //   const fullName = `${user.first_name} ${user.last_name}`;
    //   const searchTextLower = searchText.toLowerCase();

    //   // Check if the full name starts with the search text (case insensitive)
    //   return (user.first_name && user.first_name.toLowerCase().startsWith(searchTextLower)) ||
    //     (user.last_name && user.last_name.toLowerCase().startsWith(searchTextLower)) ||
    //     fullName.toLowerCase().startsWith(searchTextLower);
    // });

    const searchTextLower = searchText.toLowerCase();

    this.filteredUsers = this.allUsers.filter((user: any) => {
      if (!user?.first_name && !user?.last_name) return false;

      const first = user.first_name?.toLowerCase() ?? '';
      const last = user.last_name?.toLowerCase() ?? '';

      return (
        first.startsWith(searchTextLower) ||
        last.startsWith(searchTextLower) ||
        `${first} ${last}`.startsWith(searchTextLower)
      );
    });

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

  isThisClub(role_name: string): boolean {
    role_name = role_name.toLowerCase();
    const clubRoles = ['club', 'clube', 'klub', 'klubb'];

    // return clubRoles.includes(role_name);  
    if (clubRoles.includes(role_name)) {
      return true;
    } else {
      return false;
    }
  }


  onSearchChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value;
    if (query.length > 1) {
      this.searchSubject.next(query);
      this.classForAutoList = '';
    } else {
      this.classForAutoList = 'd-none';
    }
  }
  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

}
