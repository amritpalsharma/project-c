import { Component, Input } from '@angular/core';
// import { Component, ViewChild, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../../../services/user.service';
// import { CreateSightPopupComponent } from '../create-sight-popup/create-sight-popup.component';
import { MatPaginator } from '@angular/material/paginator';
// import { InviteTalentPopupComponent } from '../invite-talent-popup/invite-talent-popup.component';
// import { MessagePopupComponent } from '../../message-popup/message-popup.component';
// import { UploadAttachmentComponent } from '../upload-attachment/upload-attachment.component';
// import { ClubService } from '../../../../services/club.service';
import { environment } from '../../../../../../environments/environment';
import { WebPages } from '../../../../../services/webpages.service';
import { TranslateService } from '@ngx-translate/core';
import { UnverifiedUserComponent } from '../../../unverified-user/unverified-user.component';


@Component({
  selector: 'app-sighting',
  templateUrl: './sighting.component.html',
  styleUrl: './sighting.component.scss'
})
export class SightingComponent {
  @Input() userData: any;
  @Input() isPremium: any;
  @Input() currentClubId: any;
  @Input() clubArr: any;
  currentUserRole: string = '';

  userId: any = '';
  // @Input() isPremium: any;
  @Input() isUserVerified: any;
  displayedColumns: string[] = ['#', 'Event', 'Manager Name', 'Place', 'Date', 'Time', 'Status', 'View'];
  sightings: any = [];
  sightingData: any = {};
  totalSightings: any = '';
  allSelected: boolean = false;
  idsToDelete: any = [];
  imageBaseUrl: any = `${environment.url}uploads/`;
  singleIdToDelete: any = "";
  isLoading: boolean = false;
  selectedIds: number[] = [];
  baseUrl: string = 'https://api.socceryou.ch/uploads/';
  // @ViewChild(MatPaginator) paginator!: MatPaginator;
  keyword: any = "";
  view: any = "listing";
  playersInvited: any = [];
  playersInvitedFirstFour: any = [];
  playersAccepted: any = [];
  playersAcceptedFirstFour: any = [];
  deleteRepresentorConfirmation: string = '';
  selectSightingFirst: string = '';
  user: any = [];
  loggedInUser: any = localStorage.getItem('userInfo');

  attachments: any = [];
  viewSightId: any = "";
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    public dialog: MatDialog,
    public webPages: WebPages,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      console.log(params.id)
      this.userId = params.id;
      this.getSightings();
    });
    this.getToasterMsg();
    this.webPages.languageId$.subscribe((data: any) => {
      this.getToasterMsg();
    });
    this.user = this.clubArr;
  }

  getSightings() {
    this.isLoading = true;
    try {
      // const page = this.paginator ? this.paginator.pageIndex * 10 : 0;
      // const pageSize = this.paginator ? this.paginator.pageSize : 10;

      let params: any = {};
      // params.offset = page;
      // params.search = this.keyword;
      // params.limit = pageSize;

      this.userService.getClubSightings(this.userId, params).subscribe((response) => {
        if (response && response.status && response.data) {
          this.sightings = response.data.sightings;
          this.totalSightings = response.data.totalCount;
          // this.paginator.length = response.data.totalCount;
          this.isLoading = false;
        } else {
          this.totalSightings = 0;
          this.sightings = [];
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

  search(filterValue: any) {

    this.keyword = filterValue.target?.value.trim().toLowerCase();
    if (this.keyword.length >= 3) {
      this.getSightings();
    } else if (this.keyword.length == 0) {
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

  navigate(id: string): void {
    let pageRoute = 'view/' + id.toLowerCase();
    this.router.navigate([pageRoute, id]);
  }

  selectAll() {
    this.allSelected = !this.allSelected;
    if (this.allSelected) {
      this.selectedIds = this.sightings.map((fav: any) => fav.id);
    } else {
      this.selectedIds = [];
    }
  }


  viewSight(id: any) {
    this.view = 'detail';
    this.isLoading = true;
    this.viewSightId = id;
    this.userService.getClubSingleSighting(id).subscribe((response) => {
      if (response && response.status && response.data) {
        this.sightingData = response.data.sighting;
        // this.playersInvited = response.data.players_invited;
        this.playersInvited = response.data.players_invited.filter((player: any) => player.status === 'pending');
        this.playersAccepted = response.data.players_invited.filter((player: any) => player.status === 'accepted');
        // this.playersInvitedFirstFour = response.data.players_invited.slice(0, 4);
        this.playersInvitedFirstFour = response.data.players_invited.filter((player: any) => player.status === 'pending').slice(0, 4);
        this.playersAcceptedFirstFour = response.data.players_invited.filter((player: any) => player.status === 'accepted').slice(0, 4);
        this.attachments = response.data.attachments;
        this.isLoading = false;
      } else {
        this.isLoading = false;
        console.error('Invalid API response structure:', response);
      }
    });
  }


  backToSightings() {
    this.view = "listing";
  }

  downloadAttachment(path: any, fileName: any) {

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


  getImageUrl(url: any) {
    if (url) {
      return url;
    } else {
      return "../../../../../assets/images/1.png";
    }
  }

  getToasterMsg() {
    this.translateService.get([
      'confirmDeleteinformation',
      'selectSightingFirst'
    ]).subscribe((translations) => {
      this.deleteRepresentorConfirmation = translations['confirmDeleteinformation'];
      this.selectSightingFirst = translations['selectSightingFirst'];
    });
  }

  navigatePlans() {
    this.router.navigate(['/club/plans']);
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

  navigateToChat() {
    localStorage.setItem('otherUserData', '');
    console.log('User', this.user)
    // return;
    // if (this.user.meta.profile_image != '' && this.user.meta.profile_image != undefined) {
    //   this.user.meta.profile_image = this.user.meta.profile_image;
    // }
    this.loggedInUser = JSON.parse(this.loggedInUser);
    const role = this.loggedInUser.role_name.toLowerCase();
    let name_of_chat_user = this.user.first_name + ' ' + this.user.last_name;
    this.currentUserRole = this.currentUserRole.toLowerCase();
    // if (this.currentUserRole == 'club' || this.currentUserRole == 'klubb' || this.currentUserRole == 'klub' || this.currentUserRole == 'clube') {
    // }
    name_of_chat_user = this.user?.current_club_name;
    // console.info('role is ',role);
    if (this.currentUserRole == 'club' || this.currentUserRole == 'klubb' || this.currentUserRole == 'klub' || this.currentUserRole == 'Clube' && this.user.club_logo != '' && this.user.club_logo != undefined) {
      this.user.meta.profile_image = this.user.club_logo;
    }

    if (typeof this.user.meta.profile_image === undefined) {
      this.user.meta.profile_image = 'no_img.png';
    }
    // console.log('this.user.this.user',this.user);
    // return;
    if (this.user) {

      const userData = {
        id: this.user.id,
        name: name_of_chat_user,
        email: this.user.email,
        photoUrl: this.baseUrl + this.user.club_logo,
        message: 'Message From Sight Event'
      };

      console.log('ChatUser', userData);
      let tempUser = JSON.stringify(userData);

      localStorage.setItem('otherUserData', tempUser);

      const encodedUserData = encodeURIComponent(JSON.stringify(userData)); // Convert to JSON and encode
      // this.router.navigate(['/talent/chat'], { queryParams: { userData: encodedUserData } });

      localStorage.setItem('otherUserData', tempUser);

      // this.router.navigate([`/${role}/chat?open_chat=true`]);
      this.router.navigate([`/${role}/chat`], {
        queryParams: { open_chat: 'true' }
      });
    } else {
      console.warn('No userData available and this.user is ', this.user);
    }
  }
}
