import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalSettingsService } from '../../../services/global-settings.service';

interface Player {
  name: string;
  image: string;
  class?: string;
  cornerImage?: string;
  flagImage?: string;
  birthYear?: number;
}

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent implements OnInit {
  selectedTab: 'talent' | 'club' | 'scouts' = 'talent';
  isLoading: boolean = true;
  currentPage: number = 1;
  itemsPerPage: number = 8;
  number: number = 12;
  TotalCount: number = 12;
  activeAccordionIndex = 1;
  totalPagesCount: number = 12;
  myTalents: any = [];
  clubsArr: any = [];
  ScoutPlayers: any = [];
  profileBaseUrl: string = 'https://api.socceryou.ch/uploads/';
  birthCountryFlags: string = 'https://api.socceryou.ch/uploads/logos/';
  apiDefaultImage: string = '/assets/images/default/dummy-image-soccer.png';
  flagPath: string = 'https://api.socceryou.ch/uploads/logos/';
  isDefaultImage: string = 'default_img';
  constructor(private http: HttpClient, private globalSettings: GlobalSettingsService) { }

  players: Player[] = [ /* ... existing player data ... */];
  clubPlayers: Player[] = [ /* ... existing club player data ... */];
  scoutsPlayers: Player[] = [ /* ... existing scouts player data ... */];
  adVisible: boolean[] = [false, false, false, false, false];
  theme: string = localStorage.getItem('theme') || 'dark';

  ngOnInit() {
    this.fetchData('talent');
  }

  selectTab(tab: 'talent' | 'club' | 'scouts'): void {
    this.selectedTab = tab;
    this.currentPage = 1;
    this.fetchData(tab);
  }

  totalPages(): number {
    return this.totalPagesCount;
  }

  pagesToShow(): number[] {
    const total = this.totalPages();
    const pages: number[] = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(total, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchData(this.selectedTab); // Added fetchData call
      // this.fetchData(this.selectedTab); // Added fetchData call
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
      this.fetchData(this.selectedTab); // Added fetchData call
    }
  }




  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage = page;
    }
    this.fetchData(this.selectedTab);
  }

  closeAd(index: number) {
    this.adVisible[index] = false;
  }

  getNumbers(): number[] {
    return [8, 16, 24, 32, 84, 100];
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    // this.fetchData(this.selectedTab);
    // this.currentPage = 1;
    this.fetchData(this.selectedTab);
  }

  getCurrentPlayers(): Player[] {
    let playersToShow: Player[] = [];


    if (this.selectedTab === 'scouts') {
      playersToShow = this.scoutsPlayers;
    } else if (this.selectedTab === 'club') {
      playersToShow = this.clubPlayers;
    } else {
      playersToShow = this.players;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return playersToShow.slice(startIndex, startIndex + this.itemsPerPage);
  }

  fetchData(selectedTab: string) {
    this.isLoading = true;
    const url = 'https://api.socceryou.ch/api/users-frontend?=4';
    let role = '';
    if (selectedTab == 'club') {
      role = '2';
    } else if (selectedTab == 'scouts') {
      role = '3';
    } else {
      role = '4';
    }

    setTimeout(function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);  // Adjust the delay as per the content loading time

    // Calculate offset based on current page and items per page
    const offset = (this.currentPage - 1) * this.itemsPerPage;
    let user_domain = this.globalSettings.getdomainId();
    const params = {
      'whereClause[role]': role,
      'whereClause[user_domain]': user_domain,
      limit: this.itemsPerPage.toString(),
      offset: offset.toString(), // Dynamic offset
    };

    this.http.get<any[]>(url, { params }).subscribe(
      (response: any) => {

        if (selectedTab == 'club') {
          this.clubsArr = response.data.userData.users;
        } else if (selectedTab == 'scouts') {
          this.ScoutPlayers = response.data.userData.users;
        } else {
          this.myTalents = response.data.userData.users;
        }
        // Calculate total pages based on total count and items per page
        this.totalPagesCount = Math.ceil(response.data.userData.totalCount / this.itemsPerPage);
        this.TotalCount = response.data.userData.totalCount;
        this.isLoading = false;

        setTimeout(function () {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);  // Adjust the delay as per the content loading time
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getBirthYear(birthDate: string) {
    const date = new Date(birthDate);
    return date.getFullYear();
  }

  getFlagPath(jsonString: any) {
    let countryArray = JSON.parse(jsonString);
    // Access the flag path
    let flagPath = countryArray[0].flag_path;
    return flagPath;
  }

  setDefaultImage(event: any) {
    event.target.src = this.apiDefaultImage;
  }

  getFirstFlag(userNationalities: any): string | null {
    const parsedNationalities = JSON.parse(userNationalities);
    return parsedNationalities.length > 0 ? parsedNationalities[0].flag_path : '';
  }
}