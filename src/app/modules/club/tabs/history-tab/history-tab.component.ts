import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClubService } from '../../../../services/club.service';

@Component({
  selector: 'club-history-tab',
  templateUrl: './history-tab.component.html',
  styleUrls: ['./history-tab.component.scss']
})
export class HistoryTabComponent implements OnInit {
  isLoading: boolean = false;
  userId: any = "";
  history: any = "";
  isEditable: boolean = false;
  @Input() role: any;
  @ViewChild('historyTextarea', { static: false }) textarea!: ElementRef;

  constructor(private route: ActivatedRoute, private scoutService: ClubService) {}

  ngOnInit(): void {
    this.getClubHistory();
  }

  getClubHistory() {
    this.isLoading = true;
    try {
      this.scoutService.getClubHistory().subscribe((response) => {
        if (response && response.status && response.data) {
          this.history = response.data.club_history.meta_value;
          this.isEditable = !!this.history; // Set isEditable to true if history has a value
          console.log(this.history);
          console.log(this.isEditable);
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
      this.scoutService.updateClubHistory(history).subscribe((response)=>{
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
