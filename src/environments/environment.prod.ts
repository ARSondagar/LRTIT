// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'https://backend.liftme.pro/',
  fileUrl: 'https://backend.liftme.pro/files',
  socketUrl: 'https://direct.liftme.pro/direct',
  articleFilesUrl: 'https://backend.liftme.pro/static/',
  socketIG: 'https://backend.liftme.pro',

  mapKitToken: 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlZVQ1FNSzQ3V1QifQ.eyJpc3MiOiI0WEI4Q1RRNk5QIiwiaWF0IjoxNjEwNjE5Nzc5LCJleHAiOjE2NDIxMTg0MDB9.KlAdvN9TuBcQ5QcRcuAhSIovRws6GaoLM6q8fTrANsE7aHEin8K_4FCFqYMmRwwCK-OYxUpgZq81WrlNPZpSqw',
  limit: 10,
  loginName: '',
  loginPasswd: '',
  isRestricted: false
  // apiUrl: 'http://127.0.0.1:8000/',
  // fileUrl: 'http://127.0.0.1:8000/files',
  // socketUrl: 'http://127.0.0.1:3031/direct',
  // articleFilesUrl: 'http://127.0.0.1:8000/static/',
  // socketIG: 'http://127.0.0.1:8000',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
