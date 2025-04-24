import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClubService } from '../../../../../services/club.service';
import { Editor, Toolbar } from 'ngx-editor';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-club-history',
  templateUrl: './club-history.component.html',
  styleUrl: './club-history.component.scss'
})
export class ClubHistoryComponent {

  isLoading: boolean = false;
  userId: any = "";
  history: any = "";
  isEditable: boolean = false;
  @Input() role: any;
  @Input() isPremium: any;
  @Input() clubHistory: any;
  @ViewChild('historyTextarea', { static: false }) textarea!: ElementRef;
  constructor(private route: ActivatedRoute, private clubService: ClubService) { }

  ngOnInit(): void {
    // this.getClubHistory();
    // this.editor = new Editor();
  }
  
  // replaceEmptyParagraphs(html: string) {
  //   if(typeof html === undefined || html == ''){
  //       return '';
  //   }else{
  //     return html.replace(/<p>\s*<\/p>/g, "<br>");
  //   }
  // }
  replaceEmptyParagraphs(html: string): string {
    if (typeof html !== 'string' || !html.trim()) {
      return '';
    }
  
    // Replace empty or whitespace-only <p> tags with <br>
    return html.replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '<br>');
  }
  
}
