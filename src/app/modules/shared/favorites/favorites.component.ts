import { Component, ViewChild } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MessagePopupComponent } from '../message-popup/message-popup.component';
import { TalentService } from '../../../services/talent.service';
import { CommonFilterPopupComponent } from '../common-filter-popup/common-filter-popup.component';
import { WebPages } from '../../../services/webpages.service';
import { environment } from '../../../../environments/environment';
import { UserService } from '../../../services/user.service';
import { Subscription } from 'rxjs';
import { TitleService } from '../../../title.service';

@Component({
  selector: 'shared-favorites',
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss'
})

export class FavoritesComponent {
  userId: any = '';
  displayedColumns: string[] = ['#', 'Name', 'User Type', 'Location', 'Joined Date', 'View Profile', 'Remove'];
  userFavorites: any = [];
  customFilters: any = [];
  totalFavorites: any = '';
  allSelected: boolean = false;
  idsToDelete: any = [];
  totalItems: number = 0; // Total number of items for pagination
  pageSize: number = 10; // Number of items per page
  currentPage: number = 1; // Current page index
  languages: any;
  roles: any;
  locations: any = [];
  dynamicLocations: any = [];
  translatedText: string = '';
  selectFavoriteFirst: string = '';
  imageBaseUrl: any = "https://api.socceryou.ch/uploads/";
  selectedIds: number[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  keyword: any = "";
  isLoading: boolean = true;
  pageTitle: string = '';

  count: number = 0;

  loggedInUser: any = localStorage.getItem('userData');
  currentUserRole: string = '';

  // Filters and UI variables (other code omitted for brevity)
  viewsTracked: { [profileId: string]: { viewed: boolean, clicked: boolean } } = {}; // Track view and click per profile
  langSubscription!: Subscription;
  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private talentService: TalentService,
    private router: Router,
    public dialog: MatDialog,
    public webPages: WebPages,
    private translate: TranslateService,
    private translateService: TranslateService,
    private titleService: TitleService,
  ) {

    const url = this.router.url;
    const segments = url.split('/');
    // console.warn('segments',segments)
    let role = segments[1]?.toLowerCase();
    // console.warn('role',role)
    if (role != '' && role != undefined) {
      this.currentUserRole = role.toLowerCase();
    }
  }

  ngOnInit(): void {
    this.loggedInUser = JSON.parse(this.loggedInUser);
    this.getAllLanguages();
    this.getJsonTranslations();
    // this.getBlogs();
    this.route.params.subscribe((params: any) => {
      this.getUserFavorites();
    });

    this.getLocations();
    this.getUserRoles();
    this.webPages.languageId$.subscribe((data) => {
      this.getLocations();
      this.getUserRoles();
      this.getUserFavorites();
      this.getJsonTranslations();
    });
    // let envRoles:any = environment.roles;
    //     envRoles.unshift({id: 0, role: 'All'});
    // this.roles = envRoles;
    this.roles = [
      { role: "club", name: "club", slug: "club", id: 2 },
      { role: "scout", name: "scout", slug: "scout", id: 3 },
      { role: "talent", name: "talent", slug: "talent", id: 4 },
    ];
    this.updateTranslation();

    // Listen for language changes
    this.langSubscription = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.updateTranslation();
    });
  }
  updateTranslation() {
    this.translate.get('removeFavoriteConfirm').subscribe((res: string) => {
      this.translatedText = res;
    });
    this.translate.get('selectFavoriteFirst').subscribe((res: string) => {
      this.selectFavoriteFirst = res;
      // console.log('Translated Text:', res);
    });
  }

  ngOnDestroy() {
    // Prevent memory leaks by unsubscribing when component is destroyed
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
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

  getUserFavorites() {
    try {
      // Set pagination parameters
      const page = this.paginator ? this.paginator.pageIndex * 10 : 0;
      const pageSize = this.paginator ? this.paginator.pageSize : 10;

      let langId = localStorage.getItem('lang_id');

      // Prepare query parameters
      let params: any = {
        offset: page,
        limit: pageSize,
        search: this.keyword,// Search keyword
        lang: langId,
      };
      // console.warn('this.customFilters : ',this.customFilters)
      if (this.customFilters['language']) {
        params = { ...params, "lang_id": this.customFilters['language'] };
      }

      if (this.customFilters['status']) {
        params = { ...params, "status": this.customFilters['status'] };
      }

      if (this.customFilters['location']) {
        params = { ...params, "user_domain": this.customFilters['location'] };
      }

      if (this.customFilters['role']) {
        params = { ...params, "role": this.customFilters['role'] };
      }

      if (this.keyword != '' && page > 1) {
        params = { ...params, "offset": 0 };
      }
      // console.log('params : ',params);
      // Make the API request with query parameters
      this.talentService.getFavoritesData(params).subscribe((response) => {
        if (response && response.status && response.data) {
          this.isLoading = false;
          this.userFavorites = response.data[0].favorites;
          this.totalFavorites = response.data[0].totalCount;
          if (response.data[0].totalCount && response.data[0].totalCount > 0) {
            this.paginator.length = response.data[0].totalCount;
          } else if (response.data[0].totalCount && response.data[0].totalCount == 0) {
            this.userFavorites = [];
          }
          // this.roles = response.data[0].roles;
        } else {
          this.userFavorites = [];
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  onPageChange() {
    this.getUserFavorites();
  }

  search(filterValue: any) {
    this.keyword = filterValue.target?.value.trim().toLowerCase();
    if (this.keyword.length >= 3) {
      this.getUserFavorites();
    } else if (this.keyword.length == 0) {
      this.getUserFavorites();
    }
  }

  navigate(slug: string, id: Number): void {
    let pageRoute = '/' + slug.toLowerCase();
    this.router.navigate([pageRoute, id]);
  }

  navigateToExplore(): void {
    console.log('this.currentUserRole', this.currentUserRole)
    if (this.currentUserRole == 'talent' || this.currentUserRole == 'club' || this.currentUserRole == 'scout') {
      let pageRoute = '/' + this.currentUserRole + '/explore';
      this.router.navigate([pageRoute]);
    }
  }

  onCheckboxChange(user: any) {
    const index = this.selectedIds.indexOf(user.id);
    // if (index === -1) {
    //   this.selectedIds.push(user.id);
    // } else {
    //   this.selectedIds.splice(index, 1);
    // }

    if (!this.selectedIds.includes(user.id)) {
      this.selectedIds.push(user.id);
    } else {
      this.selectedIds = this.selectedIds.filter(id => id !== user.id);
    }

    if (this.userFavorites.length === this.selectedIds.length) {
      this.allSelected = true;
    } else {
      this.allSelected = false;
    }
  }

  selectAllFavorites() {

    this.allSelected = !this.allSelected;

    if (this.allSelected) {
      this.selectedIds = this.userFavorites.map((fav: any) => fav.id);
    } else {
      this.selectedIds = [];
    }
    console.log('Selected favorite IDs:', this.selectedIds);
  }

  confirmDeletion(): any {
    if (!this.checkRole()) {
      return;
    }
    if (this.selectedIds.length == 0) {
      // alert(this.selectFavoriteFirst)
      this.showMatDialog(this.selectFavoriteFirst, 'display');
      return false;
    }
    this.idsToDelete = this.selectedIds;
    this.showDeleteConfirmationPopup();
  }

  showDeleteConfirmationPopup() {
    this.showMatDialog(this.translatedText, "remove-fav-confirmation");
  }


  showFilterPopup(): void {
    const filterDialog = this.dialog.open(CommonFilterPopupComponent, {
      height: '230px',
      width: '300px',
      panelClass: 'filter_modal_popup',
      position: {
        right: '30px',
        top: '180px'
      },
      data: {
        page: 'favoritesPage',
        appliedfilters: this.customFilters,
        count: this.count,
        locations: this.dynamicLocations,
        roles: this.roles,
      }
    })

    filterDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        // this.getUserFavorites();
        console.log('Dialog result:', result);
        this.applyUserFilter(result.userFilters);
        this.count = result.filterCount;
      } else {
        console.log('Dialog closed without result');
      }
    });
  }

  openViewProfile(user: any) {
    // console.info(user)
    let role_id = user.role;
    let role = '';
    if (role_id == '2') {
      role = 'club';
    } else if (role_id == '3') {
      role = 'scout';
    } else if (role_id == '4') {
      role = 'talent';
    } else if (role_id == '6') {
      role = 'club';
    } else if (role_id == '7') {
      role = 'scout';
    }
    this.exploreUser(role, user.favorite_id);
    // const dialogRef = this.dialog.open(PlayerProfileComponent, {
    //   width: '800px',
    //   data: { user :  user }
    // });

    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     console.log('User saved:', result);
    //     // Handle the save result (e.g., update the user details)
    //   } else {
    //     console.log('User canceled the edit');
    //   }
    // });
  }

  private saveTrackedViews() {
    sessionStorage.setItem('viewsTracked', JSON.stringify(this.viewsTracked));
  }

  // Track profile click only once per session
  private trackProfileClick(profileId: number) {
    const id: number[] = [profileId];  // Create an array of profileId

    if (!this.viewsTracked[profileId]?.clicked) {
      this.talentService.trackProfiles(this.loggedInUser.id, id, 'click').subscribe({
        next: () => {
          console.log(`Click tracked for profile ${profileId}`);
          this.viewsTracked[profileId] = { ...this.viewsTracked[profileId], clicked: true };
          this.saveTrackedViews();  // Save the updated viewsTracked
        },
        error: (error) => console.error('Error tracking profile click', error)
      });
    }
  }

  exploreUser(slug: string, id: number): void {
    this.trackProfileClick(id); // Track the click before navigation
    const pageRoute = 'view/' + slug.toLowerCase();
    this.router.navigate([pageRoute, id]);
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
          this.deleteFavorites();
        }
      }
    });
  }

  deleteFavorites(): any {
    let lang = localStorage.getItem('lang_id');
    let params = { id: this.idsToDelete, lang: lang };

    this.talentService.removeFavorites(params).subscribe(
      response => {
        if (response.status) {
          this.getUserFavorites();
          this.selectedIds = [];
          this.allSelected = false;
          console.log('User deleted successfully:', response);
          if (response.message != '') {
            this.showMatDialog(response.message, 'display');
          } else {
            this.showMatDialog(response.message, 'display');
          }
        } else {
          this.showMatDialog('Error in removing favorite. Please try again.', 'display');
        }
      },
      error => {
        console.error('Error deleting user:', error);

      }
    );
  }

  confirmSingleDeletion(favoriteId: any) {
    if (!this.checkRole()) {
      return;
    }
    this.idsToDelete = [favoriteId];
    this.showMatDialog(this.translatedText, "remove-fav-confirmation");
  }
  applyUserFilter(filters: any) {
    this.customFilters = filters;
    this.getUserFavorites();
  }
  getAllLanguages() {
    this.webPages.getAllLanguage().subscribe((response) => {
      if (response.status) {
        console.log('languages', response);
        let languages = response.data.languages;


        this.languages = languages.map((value: any) => {
          return {
            id: value.id,
            language: value.language
          }
        });
      }
    });
  }

  getLocations() {
    try {
      this.userService.getLocations().subscribe((response) => {

        this.locations = response.data.domains;
        this.dynamicLocations = response.data.domains;
        console.warn(this.locations)
        this.dynamicLocations.forEach((domain: any) => {
          this.setDynamicLocation(domain);
        });
        console.info(this.dynamicLocations);
      });
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  }

  getUserRoles() {
    this.userService.getRoles().subscribe((response) => {
      this.roles = response.data.roles;
      this.roles.forEach((role: any) => {
        this.setDynamicRoles(role);
      });
      // console.log(this.roles)
      let updatedRoles = this.roles.filter((role: any) => role.id !== "1");
      updatedRoles = updatedRoles.filter((role: any) => role.id !== "5");
      updatedRoles = updatedRoles.filter((role: any) => role.id !== "6");
      updatedRoles = updatedRoles.filter((role: any) => role.id !== "7");
      this.roles = updatedRoles;
    });
  }

  setDynamicLocation(domain: any) {
    // Let's dynamically set 'location' to 'location_de' (you can modify this condition)
    let langSlug = localStorage.getItem('lang');
    if (langSlug == 'en') {
      if (domain.location_en) {
        domain.location = domain.location_en;
      }
    } else if (langSlug == 'de') {
      if (domain.location_de) {
        domain.location = domain.location_de;
      }
    } else if (langSlug == 'it') {
      if (domain.location_it) {
        domain.location = domain.location_it;
      }
    } else if (langSlug == 'fr') {
      if (domain.location_fr) {
        domain.location = domain.location_fr;
      }
    } else if (langSlug == 'es') {
      if (domain.location_es) {
        domain.location = domain.location_es;
      }
    } else if (langSlug == 'pt') {
      if (domain.location_pt) {
        domain.location = domain.location_pt;
      }
    } else if (langSlug == 'da') {
      if (domain.location_da) {
        domain.location = domain.location_da;
      }
    } else if (langSlug == 'sv') {
      if (domain.location_sv) {
        domain.location = domain.location_sv;
      }
    }
    return domain;
  }
  setDynamicRoles(role: any) {
    if (role.role_name) {
      role.role = role.role_name;
    }
  }

  convertTime(dateTime: any) {
    return this.talentService.convertTalentDateTime(dateTime);
  }

  naviGateToChat(role_id: any) {
    let role = '';
    if (role_id == '2') {
      role = 'club';
    } else if (role_id == '3') {
      role = 'scout';
    } else if (role_id == '4') {
      role = 'talent';
    } else if (role_id == '6') {
      role = 'club';
    } else if (role_id == '7') {
      role = 'scout';
    }
    // this.router.navigate([`/${role}/chat`], {
    //   queryParams: { open_chat: 'true' }
    // });
  }

  test: any;

  getJsonTranslations() {
    this.translateService.get(['favorites']).subscribe((translations) => {
      this.pageTitle = translations['favorites'];
      this.titleService.setTitle(this.pageTitle);
      console.log('Title fetch Function Fired');
    })
  }

}
