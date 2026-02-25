import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-coming-soon',
  templateUrl: './chat-coming-soon.component.html',
  styleUrl: './chat-coming-soon.component.scss'
})
export class ChatComingSoonComponent {
  isOpen = true;

  constructor(private router: Router) { }

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  goToDashboard() {
    this.close();
    this.router.navigate(['/dashboard']);
  }
}
