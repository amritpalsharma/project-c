import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-chat-coming-soon',
  templateUrl: './chat-coming-soon.component.html',
  styleUrl: './chat-coming-soon.component.scss'
})
export class ChatComingSoonComponent {
  isOpen = true;
  currentTheme: string = localStorage.getItem('theme') || 'dark';

  constructor(
    private router: Router,
    private dialogRef: MatDialogRef<ChatComingSoonComponent>
  ) { }

  open() {
    this.isOpen = true;
  }

  close() {
    // this.close();
    this.dialogRef.close();
    this.isOpen = false;
  }

  goToDashboard() {
    this.close();
    // this.router.navigate(['/dashboard']);
    this.router.navigate(['dashboard'], { relativeTo: this.router.routerState.root.firstChild });
  }
}
