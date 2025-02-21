import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AddCardComponent } from '../membership/add-card/add-card.component';

@Component({
  selector: 'app-payments-popup',
  templateUrl: './payments-popup.component.html',
  styleUrls: ['./payments-popup.component.scss']
})
export class PaymentsPopupComponent implements OnInit {

  plans: any[] = [];

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<PaymentsPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.plans = this.data.cards; // Initialize the plans array with the data passed into the dialog
    console.log(this.plans);
  }

  setPrimary(payment: any) {
    // Unset all cards as primary
    this.plans.forEach(p => p.is_default = false);
    // Set the selected card as primary
    payment.is_default = true;
    console.log('Primary card set to:', payment);
  }

  togglePrimary(payment: any) {
    // Set the card as primary and ensure others are unset
    this.setPrimary(payment);
  }

  removePayment(payment: any) {
    // this.plans = this.plans.filter(p => p !== payment);
    // console.log('Removed payment:', payment);
  }

  updatePayment(payment: any) {
    console.log('Updating payment:', payment);
  }

  addNewPaymentMethod() {
    console.log('Adding new payment method');
    
      const dialogRef = this.dialog.open(AddCardComponent, {
        width: '600px',
        data: {        }
      });
    
      // Optionally handle dialog closing events
      dialogRef.afterClosed().subscribe(result => {
        console.log('Dialog result:', result);
      });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  // Dynamically load the image based on the card brand
  getCardBrandImage(brand: string): string {
    switch (brand.toLowerCase()) {
      case 'visa':
        return 'assets/images/visa-icon.png';
      case 'mastercard':
        return 'assets/images/mastercard-icon.png';
      case 'amex':
        return 'assets/images/amex-icon.png';
      case 'discover':
        return 'assets/images/discover-icon.png';
      default:
        return 'assets/images/default-card-icon.png'; // Fallback if brand is unknown
    }
  }
}
