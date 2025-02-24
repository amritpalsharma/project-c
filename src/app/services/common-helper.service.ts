import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonHelperService {
  defaultImage: string = '../../../assets/images/1.jpg';
  defaultImageUrl: string = '../../../assets/images/1.jpg';
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
        return 'no-img.png';
    });
  }

  checkAndReturnImage(url: string, defaultImageUrl: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      
      // Handle image load success
      img.onload = () => resolve(url);
      
      // Handle image load failure (error or invalid image)
      img.onerror = () => resolve(this.defaultImageUrl);
      
      // Start loading the image
      img.src = url;
    });
  }
}
