import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ScoutService } from '../../../../services/scout.service';

@Component({
  selector: 'scout-app-history-tab',
  templateUrl: './history-tab.component.html',
  styleUrl: './history-tab.component.scss'
})
export class HistoryTabComponent {
  isLoading:boolean = false;
  userId:any = "";
  history: any = "";
  isEditable: boolean = false;
  @Input() role: any;
  @ViewChild('historyTextarea', { static: false }) textarea!: ElementRef;
  
  constructor(private route: ActivatedRoute, private scoutService: ScoutService){

  }

  ngOnInit(): void { 
    this.getScoutHistory();
  }

  getScoutHistory(){
    this.isLoading = true;
    try {
      this.scoutService.getScoutHistory().subscribe((response)=>{
        if (response && response.status && response.data) {
          this.history = response.data.company_history.meta_value; 
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
    this.updateScoutHistory();
  }

  updateScoutHistory(): any {
    const history = this.textarea.nativeElement.value;

    if(history.trim() == ""){
      return false;
    }

    try {
      this.isLoading = true;
      this.scoutService.updateScoutHistory(history).subscribe((response)=>{
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
}
