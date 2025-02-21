import { Component, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { ScoutService } from '../../../services/scout.service';

@Component({
  selector: 'edit-general-details',
  templateUrl: './edit-general-details.component.html',
  styleUrls: ['./edit-general-details.component.scss']
})
export class EditGeneralDetailsComponent {
  
  // User details
  user: any;
  positions: any[] = [];

  // Define the variables here
  contract_start: Date | null = null;
  currency: string = '';
  international_player: boolean = false;
  last_change: Date | null = null;
  main_position: string = '';
  market_value: number = 0;
  other_positions: string[] = []; // Changed to array
  social_facebook: string = '';
  social_instagram: string = '';
  social_tiktok: string = '';
  social_vimeo: string = '';
  social_x: string = ''; // assuming this is for Twitter (X)
  social_youtube: string = '';
  speed_unit: string = '';
  top_speed: number = 0;

  currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' }
  ];
  countries: any;

  constructor(
    public dialogRef: MatDialogRef<EditGeneralDetailsComponent>,
    public dialog: MatDialog,
    private scoutService: ScoutService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    // Initialize user data from passed-in data
    this.user = { ...this.data.user };  
    this.loadPositions();
    this.loadCountries();

    console.log('User Data:', this.user);

    // Assign user data to component variables
    this.contract_start = this.user.meta.contract_start || null;
    this.currency = this.user.currency || '';
    this.international_player = this.user.meta.international_player === '1';
    this.last_change = this.user.updated_at || null;
    this.main_position = this.user.meta.main_position || '';
    this.market_value = this.user.meta.market_value || 0;

    
    // Ensure that other_positions is an array of strings
    if (this.user.meta.other_position) {
      if (typeof this.user.meta.other_position === 'string') {
          this.other_positions = this.user.meta.other_position.split(',').map((pos:any) => pos.trim());
      } else {
          this.other_positions = []; // Fallback to an empty array if it's not a string
      }
    } else {
        this.other_positions = []; // Fallback to an empty array if it's not defined
    }

    this.social_facebook = this.user.meta.sm_facebook || '';
    this.social_instagram = this.user.meta.sm_instagram || '';
    this.social_tiktok = this.user.meta.sm_tiktok || '';
    this.social_vimeo = this.user.meta.sm_vimeo || '';
    this.social_x = this.user.meta.sm_x || '';
    this.social_youtube = this.user.meta.sm_youtube || '';
    this.speed_unit = this.user.meta.top_speed_unit || '';
    this.top_speed = this.user.meta.top_speed || 0;

  }


  onCancel(): void {
    this.dialogRef.close();
  }

  loadCountries(): void {
    this.scoutService.getCountries().subscribe(
      (response: any) => {
        if (response && response.status) {
          this.countries = response.data.countries;
          console.log('Countries:', this.countries);
        }
      },
      (error: any) => {
        console.error('Error fetching countries:', error);
      }
    );
  }

  loadPositions(): void {
    this.scoutService.getPositions().subscribe(
      (response: any) => {
        if (response.status) {
          this.positions = response.data.positions;
          console.log('Positions:', this.positions);
        } else {
          console.error('No data found');
        }
      },
      (error: any) => {
        console.error('Error fetching positions:', error);
      }
    );
  }

  onSave(form: NgForm): void {
    this.dialogRef.close(this.user);
    console.log(this.user);
  }

  onSubmit(myForm: NgForm): void {
    console.log(myForm.value);
    
    if (myForm.valid) {
      const formData = new FormData();

      // Append each field to FormData
      formData.append('user[in_team_since]', this.contract_start ? this.contract_start.toString() : '');
      formData.append('user[currency]', this.currency);
      formData.append('user[international_player]', this.international_player ? '1' : '0');
      formData.append('user[last_change]', this.last_change ? this.last_change.toString() : '');
      formData.append('user[main_position]', this.main_position);
      
      // Append each position in other_positions as an array
      this.other_positions.forEach(position => {
        formData.append('user[other_position][]', position); // Use [] for array
      });
      
      formData.append('user[sm_facebook]', this.social_facebook);
      formData.append('user[top_speed]', this.top_speed.toString());
      formData.append('user[top_speed_unit]', this.speed_unit);
      formData.append('user[sm_youtube]', this.social_youtube);
      formData.append('user[sm_x]', this.social_x);
      formData.append('user[sm_vimeo]', this.social_vimeo);
      formData.append('user[sm_tiktok]', this.social_tiktok);
      formData.append('user[sm_instagram]', this.social_instagram);
      
      formData.append('lang', 'en');

      this.scoutService.updateGeneralProfile(formData).subscribe(
        (response: any) => {
          console.log('Form submitted successfully:', response);
          this.dialogRef.close(response.data);
        },
        (error: any) => {
          console.error('Error submitting the form:', error);
        }
      );
    }
  }
}
