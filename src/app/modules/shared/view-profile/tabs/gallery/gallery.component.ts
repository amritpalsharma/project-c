import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../../services/user.service';
import { TalentService } from '../../../../../services/talent.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'view-user-gallery',
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent {

  userId: any = '';
  userImages: any = [];
  userVideos: any = [];
  imageBaseUrl: any = "";
  selectedFile: any = '';
  defaultCoverImage:any = ".";
  openedMenuId:any = '';
  @Input() coverImage: string = '';  // Define an input property
    @Input() isPremium: any;
    @Output() dataEmitter = new EventEmitter<string>();
  constructor(private route: ActivatedRoute, private userService: UserService,private talentService: TalentService, public dialog: MatDialog) { }
  
  ngOnInit(): void {
    this.route.params.subscribe((params:any) => {
      this.userId = params.id;
      if(this.isPremium){
        this.getGalleryData(this.userId)
      }
    });
    
    if(this.coverImage == ""){
      this.coverImage = this.defaultCoverImage;
    }
  }

  getGalleryData(id:any){
    try {
      this.talentService.getGalleryFiles(id).subscribe((response)=>{
        if (response && response.status && response.data) {
          this.userImages = response.data.images; 
          this.userVideos = response.data.videos; 
          this.imageBaseUrl = response.data.file_path;
        } else {
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      // this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

}
