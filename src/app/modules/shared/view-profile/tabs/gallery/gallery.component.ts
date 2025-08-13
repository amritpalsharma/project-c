import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../../services/user.service';
import { TalentService } from '../../../../../services/talent.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'view-user-gallery',
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent {

  currentThemeMode: string = localStorage.getItem('theme') || 'dark';
  userId: any = '';
  userImages: any = [];
  userVideos: any = [];
  imageBaseUrl: any = "";
  selectedFile: any = '';
  defaultCoverImage: any = ".";
  openedMenuId: any = '';
  showNotxtTab: boolean = false;
  @Input() coverImage: string = '';  // Define an input property
  @Input() isPremium: any;
  @Output() dataEmitter = new EventEmitter<string>();
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private talentService: TalentService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      this.userId = params.id;
      if (this.isPremium) {
        this.getGalleryData(this.userId)
      }
    });

    if (this.coverImage == "") {
      this.coverImage = this.defaultCoverImage;
    }
  }

  getGalleryData(id: any) {
    try {
      this.talentService.getGalleryFiles(id).subscribe((response) => {
        if (response && response.status && response.data) {
          this.userImages = response.data.images;
          this.userVideos = response.data.videos;
          this.imageBaseUrl = response.data.file_path;
          this.showNotxtTab = false;
          if (this.userImages.length === 0) {
            this.showNotxtTab = true;
          }
          if (this.userVideos.length === 0) {
            this.showNotxtTab = true;
          }

        } else {
          this.showNotxtTab = true;
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      // this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }
  navigateToPlans() {
    const pathname = window.location.pathname;
    const regex = /^\/view\/(talent|scout|club)\/(\d+)$/;
    const match = pathname.match(regex);
    if (match) {
      const role = match[1];
      if (['talent', 'scout', 'club'].includes(role)) {
        this.router.navigate([`/${role}/plans`]);
      }
    }
  }


  setDurationAndThumbnail(videoElement: HTMLVideoElement) {
    videoElement.crossOrigin = 'anonymous';
  }

  getThumbnailName(fileName: string): string {
    const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, ''); // Remove the file extension (e.g., '.mp4')
    return fileNameWithoutExt + '.jpg'; // Append .jpg for the thumbnail
  }
}
