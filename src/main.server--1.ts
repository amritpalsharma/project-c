import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { mergeApplicationConfig } from '@angular/core';
import { appConfigServer } from './app/app.config.server';

const config = mergeApplicationConfig(appConfig, appConfigServer);

export default function bootstrap() {
  return bootstrapApplication(AppComponent, config);
}
