import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClubService } from '../../../../services/club.service';
import { Editor } from 'ngx-editor';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'club-history-tab',
  templateUrl: './history-tab.component.html',
  styleUrls: ['./history-tab.component.scss']
})
export class HistoryTabComponent implements OnInit {
  editor!: Editor;
  isLoading: boolean = false;
  userId: any = "";
  history: any = "";
  isEditable: boolean = false;
  @Input() role: any;
  @ViewChild('historyTextarea', { static: false }) textarea!: ElementRef;

  constructor(private route: ActivatedRoute, private clubService: ClubService) {}

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

  editHistory(){
    this.isEditable = true;
  }

  updateHistory(){
    this.updateClubHistory();
  }

  updateClubHistory(): any {
    const history = this.history;

    // if(history.trim() == ""){
    //   return false;
    // }

    if(history === ""){
      return false;
    }

    try {
      this.isLoading = true;
      this.clubService.updateClubHistory(history).subscribe((response)=>{
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
