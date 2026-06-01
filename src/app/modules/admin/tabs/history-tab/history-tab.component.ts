import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { EditorConfigService } from '../../../../services/editor-config.service';
import tinymce from 'tinymce';
import { UserRoleService } from '../../../../services/user-role.service';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-history-tab',
  templateUrl: './history-tab.component.html',
  styleUrl: './history-tab.component.scss'
})
export class HistoryTabComponent {
  isLoading: boolean = false;
  userId: any = "";
  history: any = "";
  isEditable: boolean = false;
  lang: string = localStorage.getItem('lang') || 'de';
  @Input() role: any;
  @ViewChild('historyTextarea', { static: false }) textarea!: ElementRef;
  editorConfig: any;

  constructor(
    public userRoleService: UserRoleService,
    private configService: EditorConfigService,
    private route: ActivatedRoute,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      console.log(params);
      this.userId = params.id;
      if (this.role == "Scout") {
        this.getScoutHistory(this.userId);
      } else if (this.role == "Club") {
        this.getClubHistory(this.userId);
      }
      this.editorConfig = this.configService.getConfig(this.lang);
    })
  }

  getScoutHistory(userId: any) {
    this.isLoading = true;
    try {
      this.userService.getScoutHistory(userId).subscribe((response) => {
        if (response && response.status && response.data) {
          this.history = response.data.company_history.meta_value;
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.history = '';
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      this.history = '';
      this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

  getClubHistory(userId: any) {
    this.isLoading = true;
    try {
      this.userService.getClubHistory(userId).subscribe((response) => {
        if (response && response.status && response.data) {
          this.history = response.data.club_history.meta_value;
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

  editHistory() {
    this.isEditable = true;
  }

  updateHistory() {

    if (this.role == "Scout") {
      this.updateScoutHistory();
    } else if (this.role == "Club") {
      this.updateClubHistory();
    }
  }


  // ✅ This function removes only anchor tags, keeps inner content
  private removeLinks(html: string): string {
    if (!html) return '';
    if (isPlatformBrowser(this.platformId)) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      // Remove <a> tags but preserve text
      tempDiv.querySelectorAll('a').forEach(anchor => {
        const span = document.createElement('span');
        span.innerHTML = anchor.innerHTML;
        anchor.replaceWith(span);
      });

      return tempDiv.innerHTML;
    }
    return html;
  }

  updateScoutHistory(): any {
    this.isLoading = true;
    const formData = new FormData();
    const editor = tinymce.get('historyTextarea');
    let history = '';
    if (editor) {
      history = editor.getContent();
    }

    history = this.removeLinks(history);
    // const history = this.textarea.nativeElement.value;

    if (history.trim() == "") {
      return false;
    }

    try {
      this.userService.updateScoutHistory(this.userId, history).subscribe((response) => {
        if (response && response.status && response.data) {
          this.history = history;
          this.isEditable = false;
          this.isLoading = false;
          // this.isLoading = false;
        } else {
          // this.isLoading = false;
          this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      // this.isLoading = false;
      this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }

  updateClubHistory(): any {
    // const history = this.textarea.nativeElement.value;
    const editor = tinymce.get('historyTextarea');
    let history = '';
    if (editor) {
      history = editor.getContent();
    }
    this.isLoading = false;
    console.log(history);
    history = this.removeLinks(history);
    if (history.trim() == "") {
      return false;
    }

    try {
      this.userService.updateClubHistory(this.userId, history).subscribe((response) => {
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
      this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }
}
