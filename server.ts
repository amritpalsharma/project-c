import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './src/main.server';

const app = express();

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const engine = new CommonEngine();

app.set('view engine', 'html');
app.set('views', browserDistFolder);

app.get('*.*', express.static(browserDistFolder, {
  maxAge: '1y'
}));

app.get('*', (req, res, next) => {
  engine.render({
    bootstrap,
    documentFilePath: join(browserDistFolder, 'index.html'),
    url: req.originalUrl,
    publicPath: browserDistFolder,
    providers: [
      { provide: APP_BASE_HREF, useValue: req.baseUrl }
    ]
  })
  .then((html) => res.send(html))
  .catch((err) => next(err));
});

app.listen(4000, () => {
  console.log('Node server listening on http://localhost:4000');
});