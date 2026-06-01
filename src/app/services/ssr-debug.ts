import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';

export function ssrDebug(platformId: Object, name: string) {
    if (isPlatformServer(platformId)) {
        console.log('SSR DEBUG =>', name);
    }
}

export function ssrDebugMSG(platformId: Object, message: string) {
    if (isPlatformServer(platformId)) {
        console.log('SSR DEBUG =>', message);
    }
}