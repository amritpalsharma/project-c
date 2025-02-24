import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {MatTableModule,MatTableDataSource} from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BlogService } from '../../../../services/blog.service';
import { BlogPopupComponent } from './blog-popup/blog-popup.component';
import { MessagePopupComponent } from '../../message-popup/message-popup.component';
import { WebPages } from '../../../../services/webpages.service';
import { CommonFilterPopupComponent } from '../../common-filter-popup/common-filter-popup.component';
import { SharedService } from '../../../../services/shared.service';
@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss'
})
export class BlogComponent {
  blogs:any = [];
  displayedColumns: string[] = ['#','Name', 'Language', 'Published', 'Last Modified','Status','View all', 'Edit','Remove'];
  checkboxIds: string[] = [];
  lang_id: string = '';
  allSelected: boolean = false;
  userId: any; 
  newStatus: any;
  isLoading:boolean = false;
  filterValue: string = '';
  filterDialogRef:any = ""
  idsToProceed: any = [];
  selectedIds:any = [];
  customFilters:any = [];
  languages:any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor(private blogService: BlogService,private webpages:WebPages, public dialog: MatDialog, private sharedservice:SharedService, ) {}

  // ngOnInit(): void {
  //   this.getAllLanguages();
  //   this.getBlogs();
  // }

  ngOnInit(){
    this.getAllLanguages();
    this.getBlogs();
    this.sharedservice.data$.subscribe((data) => {
        if(data.action == 'lang_updated'){
            this.isLoading = true;
            this.lang_id = data.id;
            this.getBlogs();
        }
    });

    this.getAllLanguages();
  }


  getAllLanguages(){
    this.webpages.getAllLanguage().subscribe((response) => {
      if(response.status){
        console.log('languages',response);
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

  getBlogs(filterApplied:boolean = false) {
    this.isLoading = true;
    let params:any = {};
    // params.offset = page;
    params.search = this.filterValue;
    // params.limit  = pageSize;

    if(this.customFilters['language']){
      params = {...params, "lang_id" : this.customFilters['language']};
    }

    if(this.customFilters['status']){
      params = {...params, "status" : this.customFilters['status']};
    }

    if(this.customFilters['discount_type']){
      params = {...params, "whereClause[discount_type]" : this.customFilters['discount_type']};
    }

    try {
     this.blogService.getBlogs(params).subscribe((response)=>{
      if (response && response.status && response.data && response.data.blogs) {
        this.blogs = response.data.blogs; 
        // this.paginator.length = response.data.totalCount;
        this.isLoading = false;
      } else {
        this.isLoading = false;
        this.blogs = [];
        console.error('Invalid API response structure:', response);
      }
      });     
    } catch (error) {
      this.isLoading = false;
      console.error('Error fetching coupons:', error);
    }

  }

  publishBlogs(): any{
    if(this.selectedIds.length == 0){
      this.showMatDialog('Select Blog(s) first.', 'display');
      return false;
    }

    let params = {id:this.selectedIds};
    this.blogService.publishBlogs(params).subscribe(
      response => {
        if(response.status){
          this.getBlogs();
          this.selectedIds = [];
          this.allSelected = false;
          this.showMatDialog('Blog(s) published successfully!.', 'display');
        }else{
          this.showMatDialog('Error in publishing blog. Please try again.', 'display');
        }
      },
      error => {
        console.error('Error publishing blog:', error);
      }
    );
  }

  applyFilter(filterValue:any) {
    this.filterValue = filterValue.target?.value.trim().toLowerCase();
    if(this.filterValue.length >= 3){
      this.getBlogs();
     } else if(this.filterValue.length == 0){
      this.getBlogs();
     }
  }

  draftBlogs(): any{
    if(this.selectedIds.length == 0){
      this.showMatDialog('Select Blog(s) first.', 'display');
      return false;
    }

    let params = {id:this.selectedIds};
    this.blogService.draftBlogs(params).subscribe(
      response => {
        if(response.status){
          this.getBlogs();
          this.selectedIds = [];
          this.allSelected = false;
          // console.log('Coupons deleted successfully:', response);
          this.showMatDialog('Blog(s) drafted successfully!.', 'display');
        }else{
          this.showMatDialog('Error in drafting Blog. Please try again.', 'display');
        }
      },
      error => {
        console.error('Error drafted blogs:', error);
      }
    );
  }

  confirmDeletion():any {
    if(this.selectedIds.length == 0){
    //  this.showMatDialog('Select coupon(s) first.', 'display');
      return false;
    }
    this.idsToProceed = this.selectedIds;
    this.showDeleteConfirmationPopup();
  }

  showDeleteConfirmationPopup(){
      this.showMatDialog("", "delete-coupon-confirmation");
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
    });
    messageDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if(result.action == "delete-confirmed"){
          this.deleteBlogs();
        }
      //  console.log('Dialog result:', result);
      }
    });
  }

  deleteBlogs(){
    let params = {id:this.idsToProceed};
    this.blogService.deleteBlog(params).subscribe(
      response => {
        if(response.status){
          this.getBlogs();
          this.selectedIds = [];
          this.allSelected = false;
          // console.log('Coupons deleted successfully:', response);
          this.showMatDialog('Blog(s) deleted successfully!.', 'display');
        }else{
          this.showMatDialog('Error in removing Blog. Please try again.', 'display');
        }
      },
      error => {
        console.error('Error deleting coupon:', error); 
      }
    );
  }

  selectAllBlogs() {
    this.allSelected = !this.allSelected;
    if (this.allSelected) {
      this.selectedIds = this.blogs.map((coupon:any) => coupon.id);
    } else {
      this.selectedIds = [];
    }
    console.log('Selected user IDs:', this.selectedIds);
  }

  onCheckboxChange(item: any) {
    const index = this.selectedIds.indexOf(item.id);
    if (index === -1) {
      this.selectedIds.push(item.id);
    } else {
      this.selectedIds.splice(index, 1);
    }
  }

  confirmSingleDeletion(couponId:any){
    this.idsToProceed = [couponId];
    this.showDeleteConfirmationPopup();
  }

  deactivateCoupon(couponId:any){
    let params = {id:[couponId]};
  }

  editBlog(element:any){
    const dialogRef = this.dialog.open(BlogPopupComponent,{
      height: '90vh',
      width: '90vw',
      panelClass: 'blog-popup-2',
      data: element
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if(result.action == "blogAdded"){
         // this.showMessage('Blog created successfully!');
          this.getBlogs();
        }
      }
    });
  }


  applyUserFilter(filters:any){
    this.customFilters = filters;
    this.getBlogs();
  }


  showFilterPopup():void {
    const filterDialog = this.dialog.open(CommonFilterPopupComponent,{
      height: '225px',
      width: '300px',
      position: {
        right: '30px',
        top:'150px'
      },
      data: {
        page: 'blog',
        appliedfilters:this.customFilters,
        languages: this.languages,
      }
    })

    filterDialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.applyUserFilter(result);
        console.log('Dialog result:', result);
      }else{
        console.log('Dialog closed without result');
      }
    });
  }

}
