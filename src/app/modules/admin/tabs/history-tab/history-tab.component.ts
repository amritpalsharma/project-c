import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { EditorConfigService } from '../../../../services/editor-config.service';
import tinymce from 'tinymce';

@Component({
  selector: 'app-history-tab',
  templateUrl: './history-tab.component.html',
  styleUrl: './history-tab.component.scss'
})
export class HistoryTabComponent {
  isLoading:boolean = false;
  userId:any = "";
  history: any = "";
  isEditable: boolean = false;
  lang:string=localStorage.getItem('lang') || 'de';
  @Input() role: any;
  @ViewChild('historyTextarea', { static: false }) textarea!: ElementRef;
  editorConfig: any;
  
  constructor(
    private configService: EditorConfigService,
    private route: ActivatedRoute, 
    private userService: UserService){

  }

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      console.log(params);
      this.userId = params.id;
      if(this.role == "Scout"){
        this.getScoutHistory(this.userId);
      }else if(this.role == "Club"){
        this.getClubHistory(this.userId);
      }
      this.editorConfig = this.configService.getConfig(this.lang);
    })
  }

  getScoutHistory(userId:any){
    this.isLoading = true;
    try {
      this.userService.getScoutHistory(userId).subscribe((response)=>{
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

  getClubHistory(userId:any){
    this.isLoading = true;
    try {
      this.userService.getClubHistory(userId).subscribe((response)=>{
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

  editHistory(){
    this.isEditable = true;
  }

  updateHistory(){

    if(this.role == "Scout"){
      this.updateScoutHistory();
    }else if(this.role == "Club"){
      this.updateClubHistory();
    }
  }

  updateScoutHistory(): any {
    this.isLoading = true;
    const formData = new FormData();
    const editor = tinymce.get('historyTextarea');
    let history = '';
    if (editor) {
      history = editor.getContent();
    }
    // const history = this.textarea.nativeElement.value;

    if(history.trim() == ""){
      return false;
    }

    try {
      this.userService.updateScoutHistory(this.userId, history).subscribe((response)=>{
        if (response && response.status && response.data) {
          this.history = history; 
          this.isEditable = false;
          // this.isLoading = false;
        } else {
          // this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      // this.isLoading = false;
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
    console.log(history);

    if(history.trim() == ""){
      return false;
    }

    try {
      this.userService.updateClubHistory(this.userId, history).subscribe((response)=>{
        if (response && response.status && response.data) {
          this.history = history; 
          this.isEditable = false;
          // this.isLoading = false;
        } else {
          // this.isLoading = false;
          console.error('Invalid API response structure:', response);
        }
      });
    } catch (error) {
      // this.isLoading = false;
      console.error('Error fetching users:', error);
    }
  }
}
