import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';
import { User } from './user.model';
import { UserDetailPopupComponent } from './user-detail-popup/user-detail-popup.component';
import { FilterPopupComponrnt } from '../filter-popup/filter-popup.component';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MessagePopupComponent } from '../message-popup/message-popup.component';
import { SocketService } from '../../../services/socket.service';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  displayedColumns: string[] = ['#', 'Name', 'User Type', 'Language', 'Location', 'Joined Date - Time', 'Email', 'Membership', 'Status', 'Edit'];
  users: User[] = [];

  checkboxIds: string[] = [];
  allSelected: boolean = false;
  userId: any;
  newStatus: any;
  isLoading = false;
  filterValue: string = '';
  lang_id: string = '';
  filterDialogRef: any = ""

  customFilters: any = [];
  locations: any = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  constructor(private userService: UserService, public dialog: MatDialog, private socketService: SocketService, private sharedservice:SharedService) { }


  ngOnInit(): void {
    this.isLoading = true;
    this.fetchUsers();
    this.getLocations();
    //  this.showMessage("My message here");
    this.sharedservice.data$.subscribe((data) => {
        if(data.action == 'lang_updated'){
            this.isLoading = true;
            this.lang_id = data.id;
            this.fetchUsers();
            this.getLocations();
        }
    });
    
  }



  async fetchUsers(filterApplied: boolean = false): Promise<void> {

    this.isLoading = true;

    const page = this.paginator ? this.paginator.pageIndex * 10 : 0;
    const pageSize = this.paginator ? this.paginator.pageSize : 10;
    const sortOrder = this.sort ? this.sort.direction : 'asc';
    const sortField = this.sort ? this.sort.active : '';


    let params: any = {};
    params.offset = page;
    params.search = this.filterValue;
    params.limit = pageSize;

    if (filterApplied) {
      params.offset = 0;
      this.paginator.firstPage(); // to reset the page if user applied filter on any page except the first one
    }

    params.orderBy = "id";
    params.order = "desc";

    if (this.customFilters['alphabetically']) {
      params.orderBy = "first_name";
      params.order = this.customFilters['alphabetically'];
    }

    if (this.customFilters['activity']) {
      params.orderBy = "last_active";
      params.order = "desc";
    }

    if (this.customFilters['membership']) {
      params = { ...params, "whereClause[membership]": this.customFilters['membership'] };
    }

    if (this.customFilters['role']) {
      params = { ...params, "whereClause[role]": this.customFilters['role'] };
    }

    if (this.customFilters['newsletter']) {
      params = { ...params, "whereClause[newsletter]": this.customFilters['newsletter'] };
    }

    if (this.customFilters['status']) {
      params = { ...params, "whereClause[status]": this.customFilters['status'] };
    }

    if (this.customFilters['location']) {
      params = { ...params, "whereClause[user_domain]": this.customFilters['location'] };
    }

    try {
      //  this.userService.getUsers(page, pageSize,this.filterValue).subscribe((response)=>{
      this.userService.getUsers(params).subscribe((response) => {
        if (response && response.status && response.data && response.data.userData) {
          this.users = response.data.userData;
          this.paginator.length = response.data.totalCount;
          this.isLoading = false;
        } else {
          this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

  applyFilter(filterValue: any) {
    this.filterValue = filterValue.target?.value.trim().toLowerCase();
    if (this.filterValue.length >= 3) {
      this.fetchUsers();
    } else if (this.filterValue.length == 0) {
      this.fetchUsers();
    }
  }

  onPageChange() {
    this.fetchUsers();
  }
  selectedUserIds: number[] = [];

  onCheckboxChange(user: any) {
    const index = this.selectedUserIds.indexOf(user.id);
    if (index === -1) {
      this.selectedUserIds.push(user.id);
    } else {
      this.selectedUserIds.splice(index, 1);
    }
  }

  selectAllUsers() {
    this.allSelected = !this.allSelected;
    if (this.allSelected) {
      this.selectedUserIds = this.users.map(user => user.id);
    } else {
      this.selectedUserIds = [];
    }
    console.log('Selected user IDs:', this.selectedUserIds);
  }

  updateAllSelected() {
    this.allSelected = this.selectedUserIds.length === this.users.length;
  }


  getAllCheckboxIds(): string[] {
    return this.checkboxIds;
  }

  onUpdateUser(userId: number): void {
    console.log('Updating user with id:', userId);
    console.log('New status:', this.newStatus);
    this.userService.updateUserStatus(userId, this.newStatus).subscribe(
      response => {
        console.log('Response:', response);
        // alert('User status updated successfully!');
        if(response.message != ''){
          this.showMessage(response.message);
        }
      },
      error => {
        console.error('Error updating user status:', error);
        alert('Error updating user status. Please try again.');
      }
    );
  }


  editUser(user: any): void {
    console.log(user)
    const dialogRef = this.dialog.open(UserDetailPopupComponent, {
      data: user,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result !== undefined) {
        if (result.status != "") {
          this.updateUserStatus(result.user, result.status)
        }
        console.log('Dialog result:', result);
      } else {
        console.log('Dialog closed without result');
      }
    });
  }

  editfilter(): void {
    // this.getLocations();
    const filterDialog = this.dialog.open(FilterPopupComponrnt, {
      height: '450px',
      width: '300px',
      position: {
        right: '30px',
        top: '150px'
      },
      data: {
        filters: this.customFilters,
        locations: this.locations
      }
    })

    filterDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.applyUserFilter(result);
        //  console.log('Dialog result:', result);
      } else {
        console.log('Dialog closed without result');
      }
    });
  }

  applyUserFilter(filters: any) {
    this.customFilters = filters;
    this.fetchUsers(true);
  }

  getLocations() {
    try {
      this.userService.getLocations().subscribe((response) => {

        this.locations = response.data.domains;

      });
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  }

  verifyUsers(): any {
    if (this.selectedUserIds.length == 0) {
      this.showMessage('Select user(s) first.');
      return false;
    }

    this.userService.updateUserStatus(this.selectedUserIds, 2).subscribe(
      response => {
        this.fetchUsers();
        this.selectedUserIds = [];
        this.allSelected = false;
        // console.log('User status updated successfully:', response);
        if(response.message != ''){
          this.showMessage(response.message);
        }
      },
      error => {
        console.error('Error updating user status:', error);
        this.showMessage('Error updating user status. Please try again.');
        // if(response.message != ''){
        //   this.showMessage(response.message);
        // }
      }
    );

    console.log("user ids,", this.selectedUserIds);

    let jsonData = localStorage.getItem("userData");
    let userId;
    if (jsonData) {
        let userData = JSON.parse(jsonData);
        userId = userData.id;
    }
    else{
      console.log("No data found in localStorage."); 
    }
    this.socketService.emit('userVerified', {senderId: userId, receiverIds: this.selectedUserIds});
  }


  confirmDeletion(): any {
    if (this.selectedUserIds.length == 0) {
      this.showMessage('Select user(s) first.');
      return false;
    }

    this.showDeleteConfirmationPopup();
  }

  showDeleteConfirmationPopup() {
    this.showMatDialog("", "delete-confirmation");
  }


  deleteUsers(): any {
    let langId = localStorage.getItem('lang_id');
    console.log(langId, typeof(langId));
    this.userService.deleteUser(this.selectedUserIds, langId).subscribe(
      response => {
        this.fetchUsers();
        this.selectedUserIds = [];
        this.allSelected = false;
        console.log('User deleted successfully:', response);
        this.showMessage(response.message);
      },
      error => {
        console.error('Error deleting user:', error);
        this.showMessage('Error deleting user. Please try again.');
      }
    );
  }

  showMessage(message: string) {
    this.showMatDialog(message, 'display');
  }

  showMatDialog(message: string, action: string) {
    const messageDialog = this.dialog.open(MessagePopupComponent, {
      width: '500px',
      position: {
        top: '150px'
      },
      data: {
        message: message,
        action: action
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.action == "delete-confirmed") {
          this.deleteUsers();
        }
        //  console.log('Dialog result:', result);
      }
    });
  }

  updateUserStatus(user: any, status: any): any {

    let userId = [user];
    this.userService.updateUserStatus(userId, status).subscribe(
      response => {

        let index = this.users.findIndex((x: any) => x.id == user);
        this.users[index].status = status;
        // this.fetchUsers();
        // this.selectedUserIds = [];
        // this.allSelected = false;
        console.log('User status updated successfully:', response);
        // this.showMessage('User status updated successfully!');
        this.showMessage(response.message);
      },
      error => {
        console.error('Error updating user status:', error);
        this.showMessage('Error updating user status. Please try again.');
      }
    );
  }

  exportUsers(): any {

    if (this.users.length == 0) {
      this.showMessage("No users to export");
      return false;
    }

    let params: any = {};
    params.search = this.filterValue;
    params.orderBy = "id";
    params.order = "desc";

    if (this.customFilters['alphabetically']) {
      params.orderBy = "first_name";
      params.order = this.customFilters['alphabetically'];
    }

    if (this.customFilters['activity']) {
      params.orderBy = "last_active";
      params.order = "desc";
    }

    if (this.customFilters['membership']) {
      params = { ...params, "whereClause[membership]": this.customFilters['membership'] };
    }

    if (this.customFilters['role']) {
      params = { ...params, "whereClause[role]": this.customFilters['role'] };
    }

    if (this.customFilters['newsletter']) {
      params = { ...params, "whereClause[newsletter]": this.customFilters['newsletter'] };
    }

    if (this.customFilters['status']) {
      params = { ...params, "whereClause[status]": this.customFilters['status'] };
    }

    if (this.customFilters['location']) {
      params = { ...params, "whereClause[user_domain]": this.customFilters['location'] };
    }


    // this.showMessage("Call api");
    this.showMessage('Users will be exported shortly.');
    try {
      //  this.userService.getUsers(page, pageSize,this.filterValue).subscribe((response)=>{
      this.userService.exportUsers(params).subscribe((response) => {
        if (response && response.status) {
          let fileUrl = response.data.file_path;
          let fileName = response.data.file_name;
          this.download(fileUrl, fileName);
        } else {

        }
      });
    } catch (error) {
      // this.isLoading = false;
      console.error('Error fetching users:', error);
    }

  }

  async download(fileUrl: any, fileName: any) {
    // use the fetch/blob method because single download isn't working 
    fetch(fileUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob(); // Convert the response to a Blob object
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName; // Set the filename for download
        document.body.appendChild(anchor);
        anchor.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(anchor);
      })
      .catch(error => {
        console.error('There was an error downloading the file:', error);
      });
  }
}
