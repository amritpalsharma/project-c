import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClubService } from '../../../../services/club.service';
import { Editor, Toolbar } from 'ngx-editor';
import { environment } from '../../../../../environments/environment';
import { UnverifiedUserComponent } from '../../../shared/unverified-user/unverified-user.component';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'club-history-tab',
  templateUrl: './history-tab.component.html',
  styleUrls: ['./history-tab.component.scss']
})
export class HistoryTabComponent implements OnInit {
  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    //['link', 'image'],
    // ['ordered_list', 'bullet_list'],
    // ['text_color', 'background_color'],
    // ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  isLoading: boolean = false;
  userId: any = "";
  history: any = "";
  isEditable: boolean = false;
  @Input() isUserVerified: any;
  @Input() role: any;
  @Input() isPremium: any;
  @ViewChild('historyTextarea', { static: false }) textarea!: ElementRef;

  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private clubService: ClubService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getClubHistory();
    this.editor = new Editor();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  colorPresets: any = environment.colors;

  getClubHistory() {
    this.isLoading = true;
    try {
      this.clubService.getClubHistory().subscribe((response) => {
        if (response && response.status && response.data) {
          this.history = response.data.club_history.meta_value;
          console.log(this.history);
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

  replaceEmptyParagraphs(html: string) {
    return html.replace(/<p>\s*<\/p>/g, "<br>");
  }

  editHistory() {
    this.isEditable = true;
  }

  updateHistory() {
    this.updateClubHistory();
  }

  updateClubHistory(): any {
    const history = this.history;

    // if(history.trim() == ""){
    //   return false;
    // }

    if (history === "") {
      return false;
    }

    try {
      this.isLoading = true;
      this.clubService.updateClubHistory(history).subscribe((response) => {
        if (response && response.status && response.data) {
          this.history = history;
          this.isEditable = false;
          this.isLoading = false;
        } else {
          this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      // this.isLoading = false;
      console.error('Error fetching users:', error);
    }
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
}
