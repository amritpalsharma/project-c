import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EditorConfigService {
  getConfig(language: string) {
    const currentTheme = localStorage.getItem('theme'); // 'dark' or 'light'
    const isDarkMode = currentTheme === 'dark';

    return {
      apiKey: 'vtw0pppfq7efn33a7j0kgks14gccdq6g9dqbigz3vnj26ejy',
      readonly: false,
      language: language,
      language_url: `https://cdn.tiny.cloud/1/vtw0pppfq7efn33a7j0kgks14gccdq6g9dqbigz3vnj26ejy/tinymce/6/langs/${language}.js`,
      height: 400,
      plugins: 'lists link image table code textcolor',
      toolbar: 'undo redo | bold italic forecolor backcolor | alignleft aligncenter alignright | bullist numlist | heading |  code',
      // toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist | code',
      skin: isDarkMode ? 'oxide-dark' : 'oxide',
      content_css: isDarkMode ? 'dark' : 'default',
      content_style: isDarkMode ? `
        body {
          background-color: #072944 !important;
          color: #e0e0e0 !important;
        }
        .tox:not(.tox-tinymce-inline) .tox-editor-header{
           background-color: #072944 !important;
        }
        .tox-promotion{display:none}
        .tox .tox-menubar{background-color: #072944 !important;}
        .tox .tox-toolbar__primary{background-color: #072944 !important;}
        a { color: #80cbc4 !important; }
        p, h1, h2, h3, h4, h5, h6 {
          color: #e0e0e0 !important;
        }
      ` : '',
      color_map: [
        // '#FF0000', // Red
        '#e05263', // Light Mode red
        '#357525', // Light Mode Green
        '#bde34e' // Dark Mode Green
      ],
      color_cols: 5
    };
  }
}
