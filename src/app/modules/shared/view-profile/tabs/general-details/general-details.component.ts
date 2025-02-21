import { Component, Input, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'view-user-general-details',
  templateUrl: './general-details.component.html',
  styleUrls: ['./general-details.component.scss']
})
export class GeneralDetailsComponent {

    user: any = {};
    userNationalities: any = [];
    positions: any = [];
    position: any;
    mainPosition: any;
    otherPositions: any;

    @Input() userData: any;
    @Input() isPremium: any;

    constructor(public dialog: MatDialog) {}

    ngOnInit(): void {
      this.user = this.userData;
    }

    ngOnChanges(changes: SimpleChanges) {
      if (changes['userData']) {
        // Update the user object with the latest userData
        this.user = changes['userData'].currentValue;

        // Check if user_nationalities exist and parse it
        if (this.user && this.user.user_nationalities) {
          try {
            this.userNationalities = JSON.parse(this.user.user_nationalities);
          } catch (error) {
            console.error('Invalid JSON in user_nationalities:', this.user.user_nationalities, error);
            this.userNationalities = [];
          }
        }

        this.getMainPosition();
        this.getOtherPositions();
      }
    }

    calculateAge(dob: string | Date): number {
      const birthDate = new Date(dob);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      const dayDifference = today.getDate() - birthDate.getDate();

      if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
        age--;
      }

      return age;
    }

    // Function to get the main position from the array
  getMainPosition() {
    if (this.user && this.user.positions) {
      try {
        this.positions = JSON.parse(this.user.positions);
        const mainPosition = this.positions.find((pos: any) => pos.main_position === 1);
        this.position = mainPosition ? mainPosition.position_name : null;
      } catch (error) {
        console.error('Invalid JSON in positions:', this.user.positions, error);
        this.positions = [];
        this.position = null;
      }
    }
  }

    // Function to get other positions from the array
  getOtherPositions() {
    if (this.positions) {
      const otherPositions = this.positions
        .filter((pos: any) => pos.main_position == null)
        .map((pos: any) => pos.position_name)
        .join('/');

      this.otherPositions = otherPositions ? `${otherPositions}` : '';
    } else {
      this.otherPositions = '';
    }
  }

}
