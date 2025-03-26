import { Component } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { MessagePopupComponent } from '../../message-popup/message-popup.component';
import { AddRepresentatorPopupComponent } from '../../add-representator-popup/add-representator-popup.component';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../../services/shared.service';

@Component({
  selector: 'app-team-members',
  templateUrl: './team-members.component.html',
  styleUrl: './team-members.component.scss'
})
export class TeamMembersComponent {

  representators: any = [];
  userId: any = "";
  baseUrl: any = "";
  idsToDelete: any = "";
  currentUserId: string = '';
  confirmDeleteinformation: string = '';

  constructor(
    public dialog: MatDialog,
    private userService: UserService,
    private translateService: TranslateService,
    private sharedservice: SharedService,
  ) { }
  ngOnInit() {
    this.getRepresentators();
    this.getJsonTranslations();
    this.sharedservice.data$.subscribe((data: any) => {
      if (data.action == 'lang_updated') {
        this.getRepresentators();
        this.getJsonTranslations();
      }
    });
  }

  getRepresentators() {
    this.userService.getAdminRepresentators().subscribe((response) => {
      if (response && response.status && response.data) {
        console.log(response.data, 'get-representor');
        if (response.data.currentUser != '' && response.data.currentUser != undefined) {
          this.currentUserId = response.data.currentUser.id;
        }
        this.representators = response.data.representators;
        this.representators.push(response.data.currentUser);
        this.baseUrl = response.data.uploads_path
      } else {
        console.error('Invalid API response structure:', response);
      }
    });
  }

  /*getMetaValue(stringifyData:any, key:any):any{
    if(stringifyData){
      stringifyData = JSON.parse(stringifyData);
      if(stringifyData[key]){
        return stringifyData[key];
      }else{
        return "NA";
      }
    }else{
      return "NA";
    }
  }*/

  updateRepresentatorRole(event: Event, id: any) {
    const target = event.target as HTMLSelectElement;
    let newRole = target.value;
    this.userService.updateRepresentatorRole(id, { site_role: newRole }).subscribe((response) => {
      if (response && response.status) {
        if (response.message != '' && response.message != undefined) {
          this.showMatDialog(response.message, 'display');
        } else {
          this.showMatDialog("Role updated successfully.", 'display');
        }
      } else {
        console.error('Invalid API response structure:', response);
      }
    });
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
          this.deleteRepresentator();
        }
        //  console.log('Dialog result:', result);
      }
    });
  }

  confirmSingleDeletion(id: any) {
    this.idsToDelete = id;
    this.showMatDialog(this.confirmDeleteinformation, "delete-representator-confirmation");
  }


  deleteRepresentator(): any {

    this.userService.deleteRepresentator(this.idsToDelete).subscribe(
      response => {
        if (response.status) {
          this.getRepresentators();
          if (response.message != '' && response.message != undefined) {
            this.showMatDialog(response.message, 'display');
          } else {
            this.showMatDialog('Representator removed successfully!.', 'display');
          }
        } else {
          this.showMatDialog('Error in removing Representator. Please try again.', 'display');
        }
      },
      error => {
        console.error('Error deleting user:', error);

      }
    );
  }

  addRepresentator() {
    const dialog = this.dialog.open(AddRepresentatorPopupComponent, {
      height: '400',
      width: '400px',
      data: {
        action: 'admin-add'
      }
    });

    dialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.action == "added") {
          this.getRepresentators();
          if (result.message != '' && result.message != undefined) {
            this.showMatDialog(result.message, 'display');
          } else {
            this.showMatDialog("Invite sent successfully.", 'display');
          }
        }
        //  console.log('Dialog result:', result);
      }
    });
  }

  getJsonTranslations() {
    this.translateService.get(['confirmDeleteinformation3']).subscribe((translations) => {
      this.confirmDeleteinformation = translations['confirmDeleteinformation3'];
      console.log('Title fetch Function Fired');
    })
  }

}
