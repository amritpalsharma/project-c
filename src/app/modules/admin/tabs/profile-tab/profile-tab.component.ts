import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { UserEditPopupComponent } from '../../user-edit-popup/user-edit-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { MessagePopupComponent } from '../../message-popup/message-popup.component';

@Component({
  selector: 'app-profile-tab',
  templateUrl: './profile-tab.component.html',
  styleUrl: './profile-tab.component.scss'
})
export class ProfileTabComponent {
  user:any = {}
  userNationalities:any = [];
  countryFlagUrl : any;

  @Input() userData: any;
  @Input() userCountryFlag: any;
  @Output() dataEmitter = new EventEmitter<string>();
  constructor(public dialog: MatDialog) { 
    console.log('coming this data',this.userData);
    
  }
  ngAfterViewInit(){
    //console.log('coming this data',this.userData)
  }
  ngOnInit(): void {
    this.user = localStorage.getItem('userData');
    this.user = JSON.parse(this.user);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userData']) {
      if(changes['userData'].currentValue.user_nationalities){
        this.userNationalities = JSON.parse(this.userData.user_nationalities);
      }
    }
  }

  calculateAge(dob: string | Date): number {
    // Convert the input date to a Date object if it's a string
    const birthDate = new Date(dob);
    const today = new Date();
    
    // Calculate the difference in years
    let age = today.getFullYear() - birthDate.getFullYear();

    // Adjust the age if the current date is before the birthday
    const monthDifference = today.getMonth() - birthDate.getMonth();
    const dayDifference = today.getDate() - birthDate.getDate();
    
    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
      age--;
    }

    return age;
  }

  
  editPlayer(data:any, type:any){
    const dialog = this.dialog.open(UserEditPopupComponent,{
      height: '598px',
      width: '600px',
      data : {
        role: 'player',
        data:data,
        type:type
      }
    });

    dialog.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if(result.action == "updated"){
          this.dataEmitter.emit('updated');
          this.showMatDialog("Player updated successfully.",'display');
        }
      //  console.log('Dialog result:', result);
      }
    });
  }

  showMatDialog(message:string, action:string){
    const messageDialog = this.dialog.open(MessagePopupComponent,{
      width: '500px',
      position: {
        top:'150px'
      },
      data: {
        message: message,
        action: action
      }
    })
  }

  getPosition(positions:any){
    // console.log(positions)
    if(positions){
      let pos = JSON.parse(positions);
      let mainPos:any = pos.find((pos:any) => pos.main_position == 1);
      return mainPos ? mainPos.position_name : null;
    }
  }

  // getCountryFromPlaceOfBirth(placeOfBirth: string): void {
  //   if (!placeOfBirth) {
  //     console.error("Place of birth is empty.");
  //     return;
  //   }
  
  //   const apiKey = environment.googleApiKey;  // Replace with your Google Maps API key
  //   const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(placeOfBirth)}&key=${apiKey}`;
  
  //   fetch(geocodingUrl)
  //     .then(response => response.json())
  //     .then(data => {
  //       if (data.status === 'OK' && data.results.length > 0) {
  //         const addressComponents = data.results[0].address_components;
  
  //         // Extract country from address components
  //         const countryComponent = addressComponents.find((component: any) => 
  //           component.types.includes('country')
  //         );
  
  //         if (countryComponent) {
  //           const country = countryComponent.short_name;  // Set country name, use short_name for country code
  //           this.getCountryFlag(country);
  //           console.log("Country found:", countryComponent);
  //         } else {
  //           console.error("Country not found in placeOfBirth.");
  //         }
  //       } else {
  //         console.error("Geocoding API error:", data.status, data.error_message);
  //       }
  //     })
  //     .catch(error => console.error("Error fetching geocoding data:", error));
  //     return this.countryFlagUrl;
  // }
  
  // getCountryFlag(countryCode: string): void {
  //   // Using Flagpedia API for flag images
  //   const flagUrl = `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`;
    
  //   // Set the URL to an <img> element in your template or save it in a variable
  //   this.countryFlagUrl = flagUrl;
  //   return this.countryFlagUrl;
  // }
}
