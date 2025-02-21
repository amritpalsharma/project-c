import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { MessagePopupComponent } from '../message-popup/message-popup.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-club-detail',
  templateUrl: './club-detail.component.html',
  styleUrl: './club-detail.component.scss'
})
export class ClubDetailComponent implements OnInit {
  
  constructor(private route: ActivatedRoute, private userService: UserService, public dialog: MatDialog, private router: Router) { }
  activeTab: string = 'profile';
  userId: any = {};
  user: any = {};
  // userNationalities: any = [];
  coverImage: any = "";
  paginationData:any = {};

  ngOnInit(): void {
    this.route.params.subscribe((params:any) => {
      console.log(params.id)
      this.userId = params.id;
      this.getUserProfile(this.userId);
      this.activeTab = 'profile';
    });
  }

  getUserProfile(userId:any){
    try {
      this.userService.getProfileData(userId).subscribe((response)=>{
        if (response && response.status && response.data && response.data.user_data) {
          this.user = response.data.user_data; 
          this.paginationData = response.data.pagination;
          // this.userNationalities = JSON.parse(this.user.user_nationalities);
          if(this.user.meta && this.user.meta.cover_image_path){
            this.coverImage = this.user.meta.cover_image_path;
          }
          // this.isLoading = false;
        } else {
          // this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });     
    } catch (error) {
      // this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

  changeUserStatus(currentStatus:any){
    let newStatus = 2;
    if(currentStatus == 2){
      newStatus = 3;
    }
    
    this.userService.updateUserStatus([this.userId], newStatus).subscribe(response => {
        this.user.status = newStatus;
        this.showMatDialog('User status updated successfully!', 'display');
      },
      error => {
        console.error('Error updating user status:', error);
        this.showMatDialog('Error updating user status. Please try again.', 'display');
      }
    );
  }

  showMatDialog(message:string, action:string){
    const messageDialog = this.dialog.open(MessagePopupComponent,{
      width: '500px',
      position: {
        top:'150px'
      },
      data: {
        message: message,
        action: action
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if(result.action == "delete-confirmed"){
          this.deleteUser();
        }
      //  console.log('Dialog result:', result);
      }
    });
  }

  switchTab(tab: string){
    this.activeTab = tab;
  }

  confirmDeletion(){
    this.showMatDialog("", "delete-confirmation");
  }


  deleteUser(){
    let langId = localStorage.getItem('lang_id');
    this.userService.deleteUser([this.userId], langId).subscribe(
      response => {
        this.showMatDialog('User deleted successfully!', 'display');
        this.router.navigate(['/admin/users']);
      },
      error => {
        console.error('Error deleting user:', error);
        this.showMatDialog('Error deleting user. Please try again.', 'display');
      }
    );
  }

  handleCoverImageData(data: string) {
    this.coverImage = data; // Assign the received data to a variable
    console.log('Data received from child:', data);
  }

  handleRefreshAfterUpdate(data:any){
    this.getUserProfile(this.userId);
  }

  onProfileImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      let FileToUpload = input.files[0];

      console.log(FileToUpload)
      try {
        const formdata = new FormData();
        formdata.append("profile_image", FileToUpload);

        this.userService.uploadProfileImage(this.userId, formdata).subscribe((response)=>{
          if (response && response.status) {
            this.showMatDialog('Profile image updated successfully!', 'display');
            this.user.meta.profile_image_path = environment.url+"uploads/"+response.data.uploaded_fileinfo;
            // this.dataEmitter.emit(this.coverImage); // Emitting the data
            // this.isLoading = false;
          } else {
            this.showMatDialog('Error in updating profile image!', 'display');
            // this.isLoading = false;
            console.error('Invalid API response structure:', response);
          }
        });
      } catch (error) {
        // this.isLoading = false;
        console.error('Error upload image:', error); 
      }
    }
  }

  exportUser(){
    this.userService.exportSingleUser(this.userId).subscribe((response)=>{
      if (response && response.status) {
        let fileUrl = response.data.file_path;
        let fileName = response.data.file_name;
        this.download(fileUrl, fileName);
      } else {
        
      }
    });
  }

  download(fileUrl:any, fileName:any){
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

  paginate(type:any){    
    if(type == 'next'){
      let slug = this.getRoleById(this.paginationData.next.role);
      let id = this.paginationData.next.id;
      this.router.navigate(['admin/'+slug, id]);
    }else if(type == 'prev'){
      let slug = this.getRoleById(this.paginationData.prev.role);
      let id = this.paginationData.prev.id;
      this.router.navigate(['admin/'+slug, id]);
    } 
  }

  getRoleById(roleId:any):any {
    if(roleId == "2"){
      return 'club';
    }else if(roleId == "3"){
      return 'scout';
    }else if(roleId == "4"){
      return 'player';
    }
  }
}
