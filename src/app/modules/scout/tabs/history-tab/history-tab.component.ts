import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ScoutService } from '../../../../services/scout.service';
import { Editor } from 'ngx-editor';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'scout-app-history-tab',
  templateUrl: './history-tab.component.html',
  styleUrl: './history-tab.component.scss'
})
export class HistoryTabComponent {
  editor!: Editor;
  isLoading:boolean = false;
  userId:any = "";
  history: any = "";
  isEditable: boolean = false;
  loggedInUser:any = localStorage.getItem('userData');
  @Input() role: any;
  @ViewChild('historyTextarea', { static: false }) textarea!: ElementRef;
  
  constructor(private route: ActivatedRoute, private scoutService: ScoutService){

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

  getScoutHistory(){
    this.isLoading = true;
    try {
      this.scoutService.getScoutHistory().subscribe((response)=>{
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

  checkRole(){
    if(!this.loggedInUser.isRepresentator){
      return true;
    }
    if(this.loggedInUser.permission === 'admin.view'){
      return false;
    }
    if(this.loggedInUser.permission === 'admin.edit'){
      return true;
    }
    return true;
  }


  editHistory(){
    this.isEditable = true;
  }

  updateHistory(){
    this.updateScoutHistory();
  }

  updateScoutHistory(): any {
    // const history = this.textarea.nativeElement.value;

    // if(history.trim() == ""){
    //   return false;
    // }

    console.log(this.history)
    
    if(this.history === ""){
      return false;
    }

    try {
      this.isLoading = true;
      this.scoutService.updateScoutHistory(this.history).subscribe((response)=>{
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
}
