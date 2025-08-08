import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { MessagePopupComponent } from '../../message-popup/message-popup.component';
import { ScoutPlayerViewPopupComponent } from '../scout-player-view-popup/scout-player-view-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
// import {  } from '@angular/router';

@Component({
  selector: 'app-portfolio-tab',
  templateUrl: './portfolio-tab.component.html',
  styleUrl: './portfolio-tab.component.scss'
})
export class PortfolioTabComponent {

  userId: any = '';
  scoutPlayers: any = [];
  displayedColumns: string[] = ['Name', 'Language', 'Club', 'View', 'Delete'];
  // displayedColumns: string[] = ['Name', 'Language', 'Club', 'Contract Starts', 'Contract Expires', 'View', 'Delete'];
  isLoading = false;
  idToBeDeleted: any = '';

  langSubscription!: Subscription;
  currentLangId: any = localStorage.getItem('lang_id');

  baseUrl: string = 'https://api.socceryou.ch/uploads/';
  theme: string = localStorage.getItem('theme') || 'dark';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    public dialog: MatDialog,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      this.userId = params.id;
      this.getScoutPlayers();
    })
    this.langSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      // this.getUserProfile(this.userId);
      // alert('lang update to '+event.lang)
      if (event.lang == 'de') {
        this.currentLangId = 2;
      } else if (event.lang == 'en') {
        this.currentLangId = 1;
      }
      this.getScoutPlayers();
    })
  }

  getScoutPlayers() {
    this.isLoading = true;
    try {
      this.userService.getScoutPlayersAdmin(this.userId, this.currentLangId).subscribe((response) => {
        if (response && response.status && response.data) {
          this.scoutPlayers = response.data.scoutPlayers;
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.scoutPlayers = [];
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

  viewScoutPlayer(playerId: any) {
    let pageRoute = 'admin/talent';
    this.router.navigate([pageRoute, playerId]);
    // const playerViewDialog = this.dialog.open(ScoutPlayerViewPopupComponent, {
    //   width: '1000px',
    //   height: '600px',
    //   position: {
    //     top: '30px'
    //   },
    //   data: {
    //     playerId: playerId
    //   }
    // })

    // playerViewDialog.afterClosed().subscribe(result => {
    //   // if (result !== undefined) {
    //   //  console.log('Dialog result:', result);
    //   // }
    // });
  }

  confirmDeletion(id: any, firstName: any, lastName: any) {
    this.idToBeDeleted = id; //id;
    let name = firstName + " " + lastName;
    console.log(id, firstName, lastName);
    this.showMatDialog("", "delete-scout-player-confirmation", name);
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
        name: name
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
    this.userService.deleteScoutPlayer(this.idToBeDeleted).subscribe((response: any) => {
      if (response.message != '' && response.message != undefined) {
        this.showMatDialog(response.message, 'display');
      } else {
        this.showMatDialog('Player removed from Scout successfully!', 'display');
      }
      this.getScoutPlayers();
    },
      (error: any) => {
        console.error('Error deleting user:', error);
        this.showMatDialog('Error deleting user. Please try again.', 'display');
      }
    );
  }
}
