import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EditorConfigService {
  getConfig(language: string) {
    return {
      // base_url: '/tinymce',
      // suffix: '.min',
      apiKey:'vtw0pppfq7efn33a7j0kgks14gccdq6g9dqbigz3vnj26ejy',
      readonly:false,
      language: language,
      // language_url: `/assets/tinymce/langs/${language}.js`,
      language_url: `https://cdn.tiny.cloud/1/vtw0pppfq7efn33a7j0kgks14gccdq6g9dqbigz3vnj26ejy/tinymce/6/langs/de.js`, // German language file
      height: 400,
      plugins: 'lists link image table code',
      toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist | code'
    };
  }
}
