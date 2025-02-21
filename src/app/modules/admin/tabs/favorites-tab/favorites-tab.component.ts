import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../../services/user.service';
import { MessagePopupComponent } from '../../message-popup/message-popup.component';
import { MatPaginator } from '@angular/material/paginator';
@Component({
  selector: 'app-favorites-tab',
  templateUrl: './favorites-tab.component.html',
  styleUrl: './favorites-tab.component.scss'
})
export class FavoritesTabComponent {
  isLoading:boolean = false;
  userId: any = '';
  displayedColumns: string[] = ['#','Name', 'User Type', 'Location','Joined Date - Time','View Profile','Remove'];
  userFavorites: any = [];
  totalFavorites: any = '0';
  allSelected: boolean = false;
  idsToDelete: any = [];
  // imageBaseUrl: any = "";
  selectedIds: number[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  keyword:any = "";
  constructor(private route: ActivatedRoute, private userService: UserService, private router: Router, public dialog: MatDialog) { }
  
  ngOnInit(): void {
    this.route.params.subscribe((params:any) => {
      console.log(params.id)
      this.userId = params.id;
      this.getUserFavorites();
    });
  }

  getUserFavorites(){

    this.isLoading = true;
    try {
      const page = this.paginator ? this.paginator.pageIndex*10 : 0;
      const pageSize = this.paginator ? this.paginator.pageSize : 10;
    
      let params:any = {};
      params.offset = page;
      params.search = this.keyword;
      params.limit  = pageSize;

      this.userService.getFavoritesData(this.userId, params).subscribe((response)=>{
        console.log(response, 'get-user-favorite');
        if (response && response.status && response.data) {
          this.userFavorites = response.data[0].favorites;
          this.totalFavorites = response.data[0].totalCount;
          this.paginator.length = response.data[0].totalCount;
          this.isLoading = false;
        } else {
          this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

  onPageChange() {
    this.getUserFavorites();
  }

  search(filterValue:any) {
   
    this.keyword = filterValue.target?.value.trim().toLowerCase();
    if(this.keyword.length >= 3){
      this.getUserFavorites();
     } else if(this.keyword.length == 0){
      this.getUserFavorites();
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

  navigate(slug:string, id:Number): void {
    let pageRoute = 'admin/'+slug.toLowerCase();
    this.router.navigate([pageRoute, id]);
  }

  selectAllFavorites() {
    console.log('p', this.allSelected)
    this.allSelected = !this.allSelected;
    console.log('a', this.allSelected)
    if (this.allSelected) {
      this.selectedIds = this.userFavorites.map((fav:any) => fav.id);
    } else {
      this.selectedIds = [];
    }
    console.log('Selected favorite IDs:', this.selectedIds);
  }

  confirmDeletion():any {
    if(this.selectedIds.length == 0){
      this.showMatDialog('Select favorite user(s) first.', 'display');
      return false;
    }
    this.idsToDelete = this.selectedIds;
    this.showDeleteConfirmationPopup();
  }

  showDeleteConfirmationPopup(){
    this.showMatDialog("", "delete-favorite-confirmation");
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
          this.deleteFavorites();
        }
      //  console.log('Dialog result:', result);
      }
    });
  }

  deleteFavorites():any {

    let params = {id:this.idsToDelete};

    this.userService.removeFavorites(params).subscribe(
      response => {
        if(response.status){
          this.getUserFavorites();
          this.selectedIds = [];
          this.allSelected = false;
          console.log('User deleted successfully:', response);
          this.showMatDialog('Favorite(s) removed successfully!.', 'display');
        }else{
          this.showMatDialog('Error in removing favorite. Please try again.', 'display');
        }
      },
      error => {
        console.error('Error deleting user:', error);
        
      }
    );
  }

  confirmSingleDeletion(favoriteId:any){
    this.idsToDelete = [favoriteId];
    this.showMatDialog("", "delete-favorite-confirmation");
  }
}
