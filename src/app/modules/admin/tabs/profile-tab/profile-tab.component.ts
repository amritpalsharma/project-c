import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { UserEditPopupComponent } from '../../user-edit-popup/user-edit-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { MessagePopupComponent } from '../../message-popup/message-popup.component';
import { GlobalSettingsService } from '../../../../services/global-settings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserRoleService } from '../../../../services/user-role.service';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-profile-tab',
  templateUrl: './profile-tab.component.html',
  styleUrl: './profile-tab.component.scss'
})
export class ProfileTabComponent {
  user: any = {}
  currentThemeMode: string = localStorage.getItem('theme') || 'light';
  userNationalities: any = [];
  countryFlagUrl: any;
  baseUrl: string = 'https://api.socceryou.ch/uploads/';

  @Input() userData: any;
  @Input() userDataArr: any;
  @Input() userCountryFlag: any;
  @Output() dataEmitter = new EventEmitter<string>();
  scoutInfoDetails: any;
  currentClubInfo: any;
  customClubInfo: any;
  constructor(
    public userService: UserService,
    public userRoleService: UserRoleService,
    private router: Router, public dialog: MatDialog, public globalSettings: GlobalSettingsService) {


  }
  ngAfterViewInit() {
    //console.log('coming this data',this.userData)
  }
  registredClubArr: any;
  customClubArr: any;
  userNewData: any;
  ngOnInit(): void {
    this.user = localStorage.getItem('userData');
    this.user = JSON.parse(this.user);
    // console.info('coming this data', this.user);
    console.info('coming this this.user', this.userData);
    if (this.userData?.id && Number(this.userData?.id) && this.userData?.id != '' && typeof this.userData?.id !== undefined) {
      // this.getUser(this.userData?.id);
    }

    if (this.userDataArr?.meta?.have_registered_club == 1 && this.userDataArr?.registered_club_info != null) {
      this.registredClubArr = JSON.parse(this.userDataArr?.registered_club_info);
    }
    if (this.userDataArr?.meta?.have_custom_club == 1 && this.userDataArr?.custom_club_info != null) {
      this.customClubArr = JSON.parse(this.userDataArr?.custom_club_info);
      console.info('this.customClubArr',this.customClubArr)
    }
    if (this.userDataArr?.meta?.have_custom_club != 1 && this.userDataArr?.meta?.have_registered_club != 1 && this.userData?.current_club_info != null) {
      this.currentClubInfo = JSON.parse(this.userDataArr?.current_club_info);
    }


    this.globalSettings.indexFunctionCall$.subscribe(() => {
      this.themeChanged(); // Call the function when event is received
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userData']) {
      if (changes['userData'].currentValue.user_nationalities) {
        this.userNationalities = JSON.parse(this.userData.user_nationalities);
      }

      if (this.userData?.scout_info) {
        this.scoutInfoDetails = JSON.parse(this.userData?.scout_info);

        if (typeof this.scoutInfoDetails?.id !== 'number' || isNaN(this.scoutInfoDetails?.id)) {
          this.scoutInfoDetails = [];
        }
      }
    }
  }

  calculateAge(dob: string | Date): number {
    // Convert the input date to a Date object if it's a string
    const birthDate = new Date(dob);
    const today = new Date();

    // Calculate the difference in years
    let age = today.getFullYear() - birthDate.getFullYear();

    // Adjust the age if the current date is before the birthday
    const monthDifference = today.getMonth() - birthDate.getMonth();
    const dayDifference = today.getDate() - birthDate.getDate();

    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
      age--;
    }

    if (isNaN(age)) {
      age = 0;
    }

    return age;
  }


  editPlayer(data: any, type: any) {
    const dialog = this.dialog.open(UserEditPopupComponent, {
      height: '598px',
      width: '600px',
      panelClass: 'user_edit_popup_admin',
      data: {
        role: 'player',
        data: data,
        type: type
      }
    });

    dialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.action == "updated") {
          this.dataEmitter.emit('updated');

          if (result.message != null && result.message != undefined) {
            this.showMatDialog(result.message, 'display');
          } else {
            this.showMatDialog("Player updated successfully.", 'display');
          }

        }
        //  console.log('Dialog result:', result);
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
  }

  getPosition(positions: any) {
    // console.log(positions)
    if (positions) {
      let pos = JSON.parse(positions);
      let mainPos: any = pos.find((pos: any) => pos.main_position == 1);
      return mainPos ? mainPos.position_name : null;
    }
  }

  getOtherPositions(positions: any) {
    // console.log(positions)
    // if (positions) {
    //   let pos = JSON.parse(positions);

    //   // Filter out positions where main_position === 1
    //   let filteredPositions = pos.filter((position: any) => position.main_position !== 1);

    //   // Extract the position names and join them with a "/"
    //   let positionNames = filteredPositions.map((position: any) => position.position_name).join(' / ');

    //   return positionNames || null; // Return the joined string, or null if no positions match
    // }
    let otherPositions;
    if (positions) {
      // const otherPositions = this.positions
      //   .filter((pos: any) => pos.main_position == null)
      //   .map((pos: any) => pos.position_name)
      //   .join('<br>');

      // this.otherPositions = otherPositions ? `${otherPositions}` : '';
      positions = JSON.parse(positions);
      otherPositions = positions
        .filter((pos: any) => pos.main_position == null)
        .map((pos: any) => `<li>${pos.position_name}</li>`)
        .join('');

      // Then wrap the list items in <ul> tags
      otherPositions = `<ul class="player_positions_lising">${otherPositions}</ul>`;
    } else {
      otherPositions = '';
    }
    return otherPositions;
  }

  themeChanged() {
    let currentTheme = localStorage.getItem('theme');
    this.currentThemeMode = currentTheme + '';
    if (this.currentThemeMode == null || this.currentThemeMode == undefined) {
      this.currentThemeMode = 'light';
    }
  }

  naviGateScoutProfile(id: string | number): void {
    this.router.navigate(['admin', 'scout', id]);
  }




}
