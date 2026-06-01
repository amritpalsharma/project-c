console.log('====================');
console.log('SSR STARTING');
console.log('typeof document =', typeof globalThis.document);
console.log('document =', globalThis.document);

if (globalThis.document) {
  console.log(
    'document.documentElement =',
    (globalThis.document as any).documentElement
  );
}

console.log('typeof window =', typeof globalThis.window);
console.log('window =', globalThis.window);
console.log('====================');


export { AppServerModule as default } from './app/app.module.server';

process.on('uncaughtException', (err) => {
  console.error('SSR UNCAUGHT EXCEPTION');
  console.error(err.stack);
});

process.on('unhandledRejection', (err) => {
  console.error('SSR UNHANDLED REJECTION');
  console.error(err);
});

process.on('uncaughtException', (err) => {
  console.error('SSR UNCAUGHT EXCEPTION');
  console.error(err);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason: any) => {
  console.error('SSR UNHANDLED REJECTION');
  console.error(reason);
  console.error(reason?.stack);
});

process.on('uncaughtException', (err) => {
  console.error('SSR UNCAUGHT EXCEPTION');
  console.error(err);
});

process.on('unhandledRejection', (reason) => {
  console.error('SSR UNHANDLED REJECTION');
  console.error(reason);
});

(global as any).window = new Proxy({}, {
  get(target, prop) {

    // const err = new Error(`WINDOW ACCESS => ${String(prop)}`);

    // console.error('\n================ SSR WINDOW ACCESS ================\n');

    // console.error('PROPERTY:', prop);

    // console.error('\nSTACK:\n');

    // console.error(err.stack);

    // console.error('\n===================================================\n');

    // throw err;
  }
});

(global as any).document = new Proxy({}, {
  get(target, prop) {
    // const targetValue =
      // typeof target === "object"
      //   ? JSON.stringify(target, null, 2)
      //   : String(target);
    // const err = new Error(`DOCUMENT ACCESS => ${String(prop)} `);

    // console.error('\n================ SSR DOCUMENT ACCESS ================\n');

    // console.error('PROPERTY:', prop);

    // console.error('\nSTACK:\n');

    // console.error(err.stack);

    // console.error('\n=====================================================\n');

    // throw err;
  }
});