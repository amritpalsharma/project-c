
import { Router } from '@angular/router';

export const goToActiveLog = (router: Router) => {
    localStorage.setItem('makeActiveTab', 'activity');
    setTimeout(() => {
      router.navigate(['/admin/setting']);
    }, 1000);
  };


