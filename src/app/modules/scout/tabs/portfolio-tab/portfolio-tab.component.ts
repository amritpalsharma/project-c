import { Component, Input, signal, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { ScoutService } from '../../../../services/scout.service';
import { AddNewTalentComponent } from './add-new-talent/add-new-talent.component';
import { EditNewTalentComponent } from './edit-new-talent/edit-new-talent.component';
import { ChangeDetectionStrategy, inject, model, } from '@angular/core';
import { ScoutPlayerViewPopupComponent } from '../../../admin/tabs/scout-player-view-popup/scout-player-view-popup.component';
import { MessagePopupComponent } from '../../message-popup/message-popup.component';
import { InviteScoutTalentPopupComponent } from '../../invite-scout-talent-popup/invite-scout-talent-popup.component';
import { TranslateService } from '@ngx-translate/core';
import { UnverifiedUserComponent } from '../../../shared/unverified-user/unverified-user.component';

export interface DialogData {
  animal: string;
  name: string;
}
@Component({
  selector: 'scout-portfolio-tab',
  templateUrl: './portfolio-tab.component.html',
  styleUrl: './portfolio-tab.component.scss'
})
export class PortfolioTabComponent {
  readonly animal = signal('');
  readonly name = model('');
  baseUrl:string='https://api.socceryou.ch/uploads/';

  constructor(
    private route: ActivatedRoute,
    // private router: Router,
    private scoutservice: ScoutService,
    // private scoutService: ScoutService,
    public dialog: MatDialog,
    private router: Router,
    public translateService: TranslateService) {
    translateService.onLangChange.subscribe(() => {
      this.getScoutPlayers();
    });

  }

  userId: any = '';
  user: any;
  scoutPlayers: any = [];
  displayedColumns: string[] = ['Name', 'Language', 'Club', 'Status', 'View', 'Delete'];
  isLoading = false;
  uploadsPath: string = '';
  loggedInUser: any = localStorage.getItem('userData');
  logoPath: string = '';
  idToBeDeleted: any = '';
  langId: any = localStorage.getItem('lang_id');
  @Input() userData: any;
  @Input() isPremium: any;
  @Input() isUserVerified: any;
  portfolioDeleteConfirmation: string = '';
  portfolioDeletebtn: string = '';
  portfolioCloseBtn: string = '';

  ngOnInit(): void {
    this.loggedInUser = JSON.parse(this.loggedInUser);
    this.user = this.userData;
    this.userId = this.user.id;
    this.getScoutPlayers();

    this.translateService.get(['portfolioDeleteConfirmation', 'portfolioDeletebtn', 'portfolioCloseBtn']).subscribe((translations) => {
      this.portfolioDeleteConfirmation = translations['portfolioDeleteConfirmation'];
      this.portfolioDeletebtn = translations['portfolioDeletebtn'];
      this.portfolioCloseBtn = translations['portfolioCloseBtn'];
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userData']) {
      // Update the user object with the latest userData
      this.user = changes['userData'].currentValue;

    }
  }

  getStatusClass(status: any): string {
    if (status === null) return 'status-pending';
    return status === 'accepted' ? 'status-accepted' : 'status-rejected';
  }



  inviteTalent() {
    if (!this.checkRole()) {
      return;
    }
    const inviteDialog = this.dialog.open(InviteScoutTalentPopupComponent, {
      width: '600px',
      height: '450px',
      position: {
        top: '70px'
      },
      data: {
        scoutId: this.userId
      }
    })

    inviteDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        console.log(result)
        if (result.action == "added") {
          if (result.message != '' && result.message != undefined) {
            this.showMatDialog(result.message, 'display')
            this.getScoutPlayers();
          } else {
            this.showMatDialog("Players invited successfully", 'display')
            this.getScoutPlayers();
          }
        }
        console.log('Dialog result:', result);
      }
    });
  }

  getScoutPlayers() {
    this.isLoading = true;
    try {
      this.scoutservice.getScoutPlayers().subscribe((response) => {
        if (response && response.status && response.data) {
          if (response.data.scoutPlayers) {
            this.scoutPlayers = response.data.scoutPlayers;
          }
          else {
            this.scoutPlayers = []
          }
          this.uploadsPath = response.data.uploadsPath;
          this.logoPath = response.data.logoPath;
          this.isLoading = false;
        } else {
          this.scoutPlayers = []
          this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

  navigateToProfile(playerId: any) {
    this.router.navigate([`/view/talent/${playerId}`])
  }

  viewScoutPlayer(playerId: any) {
    const playerViewDialog = this.dialog.open(EditNewTalentComponent, {
      width: '1000px',
      height: '600px',
      position: {
        top: '30px'
      },
      data: {
        playerId: playerId
      }
    })

    playerViewDialog.afterClosed().subscribe(result => {
      // if (result !== undefined) {
      //  console.log('Dialog result:', result);
      // }
    });
  }

  checkRole() {
    if (!this.loggedInUser.isRepresentator) {
      return true;
    }
    if (this.loggedInUser.permission === 'admin.view' || this.loggedInUser.permission === 'admin.edit') {
      return false;
    }
    return true;
  }

  confirmDeletion(id: any, firstName: any, lastName: any) {
    if (!this.checkRole()) {
      return;
    }
    this.idToBeDeleted = id; //id;
    let name = firstName + " " + lastName;
    console.log(id, firstName, lastName);
    this.showMatDialog(this.portfolioDeleteConfirmation, "portfolio-delete-confirmation", name);
  }

  showMatDialog(message: string, action: string, name: any = '') {
    const messageDialog = this.dialog.open(MessagePopupComponent, {
      width: '500px',
      position: {
        top: '150px'
      },
      data: {
        message: message,
        action: action,
        name: name,
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.action == "delete-confirmed") {
          this.deleteScoutPlayer();
        }
        //  console.log('Dialog result:', result);
      }
    });
  }

  deleteScoutPlayer() {
    let langId = localStorage.getItem('lang_id');
    this.scoutservice.deleteScoutPlayer(this.idToBeDeleted, langId).subscribe((response: any) => {
      if (response && response.status) {
        if (response.message != '' && response.message != undefined) {
          this.showMatDialog(response.message, 'display')
        } else {
          this.showMatDialog('Player removed from Scout successfully!', 'display');
        }
        this.getScoutPlayers();
      }
    },
      (error: any) => {
        console.error('Error deleting user:', error);
        this.showMatDialog('Error deleting user. Please try again.', 'display');
      }
    );
  }

  navigatePlans() {
    this.router.navigate(['/scout/plans']);
  }

  showVerificationPopup() {
    const messageDialog = this.dialog.open(UnverifiedUserComponent, {
      width: '500px',
      position: {
        top: '150px'
      }
    })

    messageDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.action == "delete-confirmed") {
          // this.deleteUser();
        }
      }
    });
  }
}
