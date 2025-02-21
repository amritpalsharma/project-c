import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-purchase-tab',
  templateUrl: './purchase-tab.component.html',
  styleUrl: './purchase-tab.component.scss'
})
export class PurchaseTabComponent {
  isLoading:boolean = false;
  userId: any = '';
  userPurchases: any = [];
  // imageBaseUrl: any = "";
  allSelected: boolean = false;
  idsToDownload: any = [];
  selectedIds: number[] = [];
  errorMsg:string='';
  constructor(private route: ActivatedRoute, private userService: UserService, private router: Router) { }
  
  ngOnInit(): void {
    this.route.params.subscribe((params:any) => {
      console.log(params.id)
      this.userId = params.id;
      this.getUserPurchases(this.userId)
    });
  }

  getUserPurchases(userId:any){
    this.isLoading = true;
    try {
      this.userService.getPurchaseData(userId).subscribe((response)=>{
        if (response && response.status && response.data) {
          this.userPurchases = response.data.purchaseHistory;
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

  onCheckboxChange(user: any) {
    const index = this.selectedIds.indexOf(user.id);
    if (index === -1) {
      this.selectedIds.push(user.id);
    } else {
      this.selectedIds.splice(index, 1);
    }
  }

  selectAllCheckboxes() {
    console.log('p', this.allSelected)
    this.allSelected = !this.allSelected;
    console.log('a', this.allSelected)
    if (this.allSelected) {
      this.selectedIds = this.userPurchases.map((fav:any) => fav.id);
    } else {
      this.selectedIds = [];
    }
    console.log('Selected favorite IDs:', this.selectedIds);
  }

  async downloadInvoice(invoideId:any, invoiceUrl:any){
     // use the fetch/blob method because single download isn't working 
    fetch(invoiceUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob(); // Convert the response to a Blob object
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'invoice-'+invoideId+'.pdf'; // Set the filename for download
        document.body.appendChild(anchor);
        anchor.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(anchor);
      })
      .catch(error => {
        console.error('There was an error downloading the file:', error);
      });
  }

  downloadAll():any{
    if(this.selectedIds.length == 0){
      this.errorMsg = "Please select at least 1 purchase";
      setTimeout(() => {
        this.errorMsg = '';
      }, 1000)
      return false;
    }

    const allLinksToDownload = this.selectedIds.map(id => {
      // Find the user object by matching the id
      const purchase = this.userPurchases.find((purchase:any) => purchase.id === id);
      
      // Return the image link if the user is found, otherwise return null or undefined
      return purchase ? purchase.invoice_file_path : null;
    });
    this.downloadAllFiles(allLinksToDownload);
  }

  async downloadAllFiles(allLinksToDownload:any) {
    // Loop over each file URL and trigger the download sequentially
    for (const [index, fileUrl] of allLinksToDownload.entries()) {
      // Call downloadFile with each URL and a custom filename
      await this.downloadInvoice(index+1, fileUrl);
    }
  }

}
