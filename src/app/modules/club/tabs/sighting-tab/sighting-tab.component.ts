import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../../services/user.service';
import { CreateSightPopupComponent } from '../create-sight-popup/create-sight-popup.component';
import { MatPaginator } from '@angular/material/paginator';
import { InviteTalentPopupComponent } from '../invite-talent-popup/invite-talent-popup.component';
import { MessagePopupComponent } from '../../message-popup/message-popup.component';
import { UploadAttachmentComponent } from '../upload-attachment/upload-attachment.component';
import { ClubService } from '../../../../services/club.service';
import { environment } from '../../../../../environments/environment';
@Component({
  selector: 'club-sighting-tab',
  templateUrl: './sighting-tab.component.html',
  styleUrl: './sighting-tab.component.scss'
})


export class SightingTabComponent {
  userId: any = '';
  displayedColumns: string[] = ['#','Event', 'Manager Name', 'Place','Date','Time','View','Remove'];
  sightings: any = [];
  sightingData: any = {};
  totalSightings: any = '';
  allSelected: boolean = false;
  idsToDelete: any = [];
  imageBaseUrl: any = `${environment.url}uploads/`;
  singleIdToDelete: any = "";
  isLoading:boolean = false;
  selectedIds: number[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  keyword:any = "";
  view:any = "listing";
  playersInvited: any = [];
  playersInvitedFirstFour: any = [];
  
  attachments:any = [];
  viewSightId:any = "";
  constructor(private route: ActivatedRoute, private clubService: ClubService, private router: Router, public dialog: MatDialog) { }
  
  ngOnInit(): void {
    this.route.params.subscribe((params:any) => {
      console.log(params.id)
      this.userId = params.id;
      this.getSightings();
    });
  }

  getSightings(){ 
    this.isLoading = true;
    try {
      const page = this.paginator ? this.paginator.pageIndex * 10 : 0;
      const pageSize = this.paginator ? this.paginator.pageSize : 10;
    
      let params:any = {};
      params.offset = page;
      params.search = this.keyword;
      params.limit  = pageSize;

      this.clubService.getSightings(this.userId, params).subscribe((response)=>{
        if (response && response.status && response.data) {
          this.sightings = response.data.sightings;
          // this.totalSightings = response.data.totalCount;
          this.paginator.length = response.data.totalCount;
          this.isLoading = false;
        } else {
          this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      // this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

  onPageChange() {
    this.getSightings();
  }

  search(filterValue:any) {
   
    this.keyword = filterValue.target?.value.trim().toLowerCase();
    if(this.keyword.length >= 3){
      this.getSightings();
     } else if(this.keyword.length == 0){
      this.getSightings();
     }
   
  }

  onCheckboxChange(user: any) {
    const index = this.selectedIds.indexOf(user.id);
    if (index === -1) {
      this.selectedIds.push(user.id);
    } else {
      this.selectedIds.splice(index, 1);
    }
  }

  navigate(id:string): void {
    let pageRoute = 'view/'+id.toLowerCase();
    this.router.navigate([pageRoute, id]);
  }

  selectAll() {
    this.allSelected = !this.allSelected;
    if (this.allSelected) {
      this.selectedIds = this.sightings.map((fav:any) => fav.id);
    } else {
      this.selectedIds = [];
    }
  }

  confirmDeletion():any {
    if(this.selectedIds.length == 0){
      this.showMatDialog('Select sighting(s) first.', 'display');
      return false;
    }
    this.idsToDelete = this.selectedIds;
    this.showDeleteConfirmationPopup();
  }

  showDeleteConfirmationPopup(){
    this.showMatDialog("Are you sure You want to delete this?", "delete-sighting-confirmation");
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
          this.deleteSightings();
        }
      //  console.log('Dialog result:', result);
      }
    });
  }

  deleteSightings():any {

    let params = {id:this.idsToDelete};

    this.clubService.deleteSightings(params).subscribe(
      response => {
        if(response.status){
          this.getSightings();
          this.selectedIds = [];
          this.allSelected = false;
          
          this.showMatDialog('Sighting(s) deleted successfully!.', 'display');
          this.getSightings();
        }else{
          this.showMatDialog('Error in deleting sighting. Please try again.', 'display');
          this.getSightings();
        }
      },
      error => {
        console.error('Error deleting sighting:', error);
        
      }
    );
  }

  confirmSingleDeletion(id:any){
    this.idsToDelete = [id];
    this.showMatDialog("", "delete-sighting-confirmation");
  }

  createSightPopup(){
    const messageDialog = this.dialog.open(CreateSightPopupComponent,{
      width: '750px',
      position: {
        top:'70px'
      },
      data: {
        clubId: this.userId
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if(result.action == "added"){
          this.getSightings();
          this.showMatDialog("Sighting added successfully", 'display');
        }
         console.log('Dialog result:', result);
      }
    });
  }

  editSight(sightData:any, playersInvited:any){
    const editDialog = this.dialog.open(CreateSightPopupComponent,{
      width: '750px',
      position: {
        top:'70px'
      },
      data: {
        clubId: this.userId,
        sightData: sightData,
        invitees: playersInvited
      }
    })

    editDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if(result.action == "updated"){
          this.viewSight(result.id);
          this.showMatDialog("Sighting updated successfully", 'display');
        }
         console.log('Dialog result:', result);
      }
    });
  }

  uploadAttachment(){
    const uploadDialog = this.dialog.open(UploadAttachmentComponent,{
      width: '650px',
      position: {
        top:'70px'
      },
      data: {
        id: this.viewSightId
      }
    })

    uploadDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if(result.action == "added"){
          this.viewSight(result.id);
          this.showMatDialog("Attachment(s) added successfully", 'display');
        }
        //  console.log('Dialog result:', result);
      }
    });
  }

  viewSight(id:any){
    this.view = 'detail';
    this.isLoading = true;
    this.viewSightId = id;
    this.clubService.getSingleSighting(id).subscribe((response)=>{
      if (response && response.status && response.data) {
        this.sightingData = response.data.sighting;
        this.playersInvited = response.data.players_invited;
        this.playersInvitedFirstFour = response.data.players_invited.slice(0, 4);
        this.attachments = response.data.attachments;;
        this.isLoading = false;
      } else {
        this.isLoading = false;
        console.error('Invalid API response structure:', response);
      }
    });
  }

  inviteTalentsPopup(eventName:any){
    const inviteDialog = this.dialog.open(InviteTalentPopupComponent,{
      width: '700px',
      height:'530px',
      position: {
        top:'70px'
      },
      data: {
        action: "inviteUsers",
        data: eventName,
        sightId: this.viewSightId
      }
    })

    inviteDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        console.log(result)
        if(result.action == "added"){
          this.viewSight(result.id);
          this.showMatDialog("Players invited successfully", 'display')
        }
         console.log('Dialog result:', result);
      }
    });
  }

  viewInvitees(players:any){
    const inviteesDialog = this.dialog.open(InviteTalentPopupComponent,{
      width: '700px',
      height:'530px',
      position: {
        top:'70px'
      },
      data: {
        action: "showInvitedUsers",
        data: players
      }
    })

    inviteesDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
         console.log('Dialog result:', result);
      }
    });
  }

  backToSightings(){
    this.view = "listing";
  }

  downloadAttachment(path:any, fileName:any){
      
    fetch(path)
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

  /* confirmDeletion():any {
    if(this.selectedIds.length == 0){
      this.showMatDialog('Select favorite user(s) first.', 'display');
      return false;
    }
    this.idsToDelete = this.selectedIds;
    this.showDeleteConfirmationPopup();
  } */

    showMatDialogV2(message:string, action:string){
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
          this.deleteAttachment();
        }
      //  console.log('Dialog result:', result);
      }
    });
  }
  confirmDeleteAttachment(id:any){
    this.singleIdToDelete = id;
    this.showMatDialogV2("", "delete-attachment-confirmation");
  }
  
  deleteAttachment():any {

    this.clubService.deleteAttachment(this.singleIdToDelete).subscribe(
      response => {
        if(response.status){
          this.singleIdToDelete = "";
          let index = this.attachments.findIndex((x:any) => x.id == this.singleIdToDelete);
          let temp = this.attachments;
          temp.splice(index,1);
          this.attachments = temp;
          this.showMatDialog('Attachment removed successfully!.', 'display');
        }else{
          this.showMatDialog('Error in removing attachment. Please try again.', 'display');
        }
      },
      error => {
        console.error('Error deleting attachment:', error);
      }
    );
  }

  getImageUrl(url:any){
    if(url){
      return url;
    }else{
      return "../../../../../assets/images/1.jpg";
    }
  }
}