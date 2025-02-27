import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
  selectedTab: 'talent' | 'club' | 'scouts' = 'talent'; // Updated to include 'scouts'
  currentPage: number = 1;
  itemsPerPage: number = 12; // Default to 5 items per page on refresh
  number: number = 12; // Defined the 'number' property
  activeAccordionIndex = 1;
  totalPagesCount: number = 12;
  myTalents: any;
  myClubs: any;
  scoutProfiles: any;
  logoBaseUrl: string = '';
  imagePath: string = '';
  isLoading:boolean = false;
  constructor(private http: HttpClient) { }

  players: Player[] = [
    { name: 'Zidane', image: './assets/images/ziddane.png', class: 'midfielder', cornerImage: './assets/images/FC Thun 1.png', flagImage: './assets/images/flag.svg', birthYear: 1972 },
    { name: 'Ronaldinho Gaúcho', image: './assets/images/Ronaldinho Gaúcho.png', cornerImage: './assets/images/FC Thun 1.png', flagImage: './assets/images/flag.svg', birthYear: 1972 }
  ];

  clubPlayers: Player[] = [
    { name: 'Gabriel Jesus', image: './assets/images/Gabriel Jesus.png', cornerImage: './assets/images/FC Thun 1.png', flagImage: './assets/images/flag.svg', birthYear: 1972 },
    { name: 'Messi', image: './assets/images/Messi.png', cornerImage: './assets/images/FC Thun 1.png', flagImage: './assets/images/flag.svg', birthYear: 1972 }
  ];

  scoutsPlayers: Player[] = [
    { name: 'Cristiano Ronaldo', image: './assets/images/cristo-ronaldo.png', cornerImage: './assets/images/FC Thun 1.png', flagImage: './assets/images/flag.svg', birthYear: 1972 },
    { name: 'Jermain Defoe', image: './assets/images/Jermain Defoe.png', cornerImage: './assets/images/FC Thun 1.png', flagImage: './assets/images/flag.svg', birthYear: 1972 }
  ];

  // adVisible: boolean[] = [true, true, true, true, true];
  adVisible: boolean[] = [false, false, false, false, false];

  ngOnInit() {
    this.fetchData('talent');
    this.itemsPerPage = 8;
  }

  selectTab(tab: 'talent' | 'club' | 'scouts'): void {
    this.selectedTab = tab;
    this.currentPage = 1;
    this.fetchData(tab);
  }

  // totalPages(): number {
  //   const totalItems = this.players.length;
  //   return Math.ceil(totalItems / this.itemsPerPage); // Calculate total pages based on items per page
  // }

  // Calculate total pages (currently it's fixed to 12 in this example)
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
    return [8, 16, 24, 32, 84, 100]; // List of options for "items per page"
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
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

    // Calculate offset based on current page and items per page
    const offset = (this.currentPage - 1) * this.itemsPerPage;

    const params = {
      'whereClause[role]': role,
      limit: this.itemsPerPage.toString(),
      offset: offset.toString(), // Dynamic offset
    };

    // this.http.get<any[]>(url, { params }).subscribe(
    this.http.get<any[]>(url, { params }).subscribe(
      (response: any) => {
        if (selectedTab == 'scouts') {
          this.scoutProfiles = response.data.userData.users;
        } else if (selectedTab == 'club') {
          this.myClubs = response.data.userData.users;
        } else {
          this.myTalents = response.data.userData.users;
        }
        this.logoBaseUrl = response.data.userData.logoPath;
        this.imagePath = response.data.userData.imagePath;
        // Calculate total pages based on total count and items per page
        this.totalPagesCount = Math.ceil(response.data.userData.totalCount / this.itemsPerPage);
        this.isLoading = false;
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

  getFlagPath(jsonString : string) {
    // const jsonString = '[{"country_name": "India", "flag_path": "https://api.socceryou.ch/uploads/logos/India.svg"}]';

    // Parse the JSON string into a JavaScript object
    const countries = JSON.parse(jsonString);

    // Extract the flag path (assuming only one object in the array)
    const flagPath = countries.length > 0 ? countries[0].flag_path : null;

    console.log(flagPath);
    // Output: "https://api.socceryou.ch/uploads/logos/India.svg"

  }
}
