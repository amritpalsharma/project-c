# Angular Project

This is an Angular project that includes various modules and components, including an image cropper feature.

## Project Structure

```
angular-project
├── src
│   ├── app
│   │   ├── app-routing.module.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.component.ts
│   │   ├── app.module.ts
│   │   ├── modules
│   │   │   ├── shared
│   │   │   │   ├── image-cropper
│   │   │   │   │   ├── image-cropper.component.html
│   │   │   │   │   ├── image-cropper.component.scss
│   │   │   │   │   ├── image-cropper.component.ts
│   │   │   │   │   └── image-cropper.module.ts
│   │   │   │   └── shared.module.ts
│   │   │   └── website
│   │   │       └── website.module.ts
│   │   └── services
│   │       └── auth.interceptor.ts
│   ├── assets
│   │   └── i18n
│   │       ├── en.json
│   │       └── es.json
│   ├── environments
│   │   ├── environment.prod.ts
│   │   └── environment.ts
│   └── styles.scss
├── angular.json
├── package.json
├── tsconfig.app.json
├── tsconfig.json
└── README.md
```

## Features

- **Image Cropper**: A component for cropping images, located in the `src/app/modules/shared/image-cropper` directory.
- **Internationalization**: Supports multiple languages with translation files located in `src/assets/i18n`.
- **Authentication**: Implements HTTP interception for authentication purposes.

## Getting Started

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd angular-project
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Run the application:
   ```
   ng serve
   ```

5. Open your browser and navigate to `http://localhost:4200`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.