import { Component } from '@angular/core';

interface Permission {
  name: string;
  description: string;
  enabled: boolean;
}

@Component({
  selector: 'app-new-chat',
  templateUrl: './new-chat.component.html',
  styleUrl: './new-chat.component.scss'
})
export class NewChatComponent {
  permissions: Permission[] = [
    { name: 'Email Notifications', description: 'Receive updates via email.', enabled: true },
    { name: 'SMS Alerts', description: 'Get alerts via SMS.', enabled: false },
    { name: 'Personalized Ads', description: 'Receive personalized advertisements.', enabled: true }
  ];

  allowAll() {
    this.permissions.forEach(permission => {
      permission.enabled = true;
    });
  }

  refuseAll() {
    this.permissions.forEach(permission => {
      permission.enabled = false;
    });
  }

  savePreferences() {
    // Logic to save preferences, e.g., send to a backend API
    console.log('Preferences saved:', this.permissions);
    // Optionally, close the modal after saving
  }

}
