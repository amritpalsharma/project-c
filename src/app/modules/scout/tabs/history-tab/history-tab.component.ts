import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ScoutService } from '../../../../services/scout.service';
import { Editor, Toolbar } from 'ngx-editor';
import { environment } from '../../../../../environments/environment';
import { UnverifiedUserComponent } from '../../../shared/unverified-user/unverified-user.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'scout-app-history-tab',
  templateUrl: './history-tab.component.html',
  styleUrl: './history-tab.component.scss'
})
export class HistoryTabComponent {
  editor!: Editor;

  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    // ['link', 'image'],
    // ['ordered_list', 'bullet_list'],
    // ['text_color', 'background_color'],
    // ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  isLoading: boolean = false;
  userId: any = "";
  history: any = "";
  isEditable: boolean = false;
  loggedInUser: any = localStorage.getItem('userData');
  @Input() role: any;
  @Input() isPremium: any;
  @Input() isUserVerified: any;
  @ViewChild('historyTextarea', { static: false }) textarea!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private scoutService: ScoutService,
    public dialog: MatDialog
  ) {

  }

  ngOnInit(): void {
    this.loggedInUser = JSON.parse(this.loggedInUser);
    this.getScoutHistory();
    this.editor = new Editor();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  colorPresets: any = environment.colors;

  getScoutHistory() {
    this.isLoading = true;
    try {
      this.scoutService.getScoutHistory().subscribe((response) => {
        if (response && response.status && response.data) {
          this.history = response.data.company_history.meta_value;
          // this.history = '<h1>dsdf</h1>';
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

  // replaceEmptyParagraphs(html: string) {
  //   return html.replace(/<p>\s*<\/p>/g, "<br>");
  // }

  replaceEmptyParagraphs(html?: string): string {
    if (typeof html !== 'string' || !html.trim()) {
      return '';
    }

    // Replace truly empty or whitespace-only <p> tags
    return html.replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '<br>');
  }



  checkRole() {
    if (!this.loggedInUser.isRepresentator) {
      return true;
    }
    if (this.loggedInUser.permission === 'admin.view') {
      return false;
    }
    if (this.loggedInUser.permission === 'admin.edit') {
      return true;
    }
    return true;
  }


  editHistory() {
    this.isEditable = true;
  }

  updateHistory() {
    this.updateScoutHistory();
  }

  updateScoutHistory(): any {
    // const history = this.textarea.nativeElement.value;

    // if(history.trim() == ""){
    //   return false;
    // }

    console.log(this.history)

    if (this.history === "") {
      return false;
    }

    try {
      this.isLoading = true;
      this.scoutService.updateScoutHistory(this.history).subscribe((response) => {
        if (response && response.status && response.data) {
          // this.history = history; 
          this.isEditable = false;
          this.isLoading = false;
        } else {
          this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  navigatePlans() {
    this.router.navigate(['/scout/plans']);
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
