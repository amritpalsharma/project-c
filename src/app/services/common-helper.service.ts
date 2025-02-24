import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonHelperService {
  defaultImage: string = '../../../assets/images/1.jpg';
  profileImage: string = '';
  constructor() { }
  checkImageExists(imageUrl: string): void {
    fetch(imageUrl, { method: 'HEAD' })
    .then(response => {
        // If status is 200 (OK), image exists
        return imageUrl;
    })
    .catch(() => {
        // If fetch fails (image not found or error), return false
        return this.defaultImage;
    });
  }
}
