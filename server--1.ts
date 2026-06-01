import 'zone.js/node';

import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import bootstrap from './src/main.server';

export function app(): express.Express {
  const server = express();

  const browserDistFolder = join(process.cwd(), 'dist/c/browser');

  const indexHtml = existsSync(join(browserDistFolder, 'index.original.html'))
    ? join(browserDistFolder, 'index.original.html')
    : join(browserDistFolder, 'index.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  server.get(
    '*.*',
    express.static(browserDistFolder, {
      maxAge: '1y',
    }),
  );

  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  const server = app();

  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();

export default bootstrap;
```
