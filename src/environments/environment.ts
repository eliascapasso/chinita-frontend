// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  // firebase: {
  //   apiKey: 'AIzaSyCXVTjTuBUXf-UWlpKfKHjomfPezutmPwI',
  //   authDomain: 'cas-fee-shop.firebaseapp.com',
  //   databaseURL: 'https://cas-fee-shop.firebaseio.com',
  //   projectId: 'cas-fee-shop',
  //   storageBucket: 'cas-fee-shop.appspot.com',
  //   messagingSenderId: '323643286137'
  // },
  firebase: {
    apiKey: "AIzaSyDND3cwYE_2HsEJts7yOSyjgqGGmqus6no",
    authDomain: "tienda-online-base.firebaseapp.com",
    databaseURL: "https://tienda-online-base-default-rtdb.firebaseio.com",
    projectId: "tienda-online-base",
    storageBucket: "tienda-online-base.appspot.com",
    messagingSenderId: "927400481935",
    appId: "1:927400481935:web:77118240db1484ea598cfa",
    measurementId: "G-3TCBS0C504"
  },
  //Contacto
  telefono: "+59 9 343 4705899",
  correo: "elias_capasso@live.com",
  direccion: "Belgrano 1337",
  localidad: "Crespo",
  provincia: "Entre Rios",
  pais: "Argentina",
  empresa: "Capasso Elias Nicolas",

  //Enlaces
  wsp: "https://wa.link/fw8xba",
  instagram: "https://www.instagram.com/eliascapasso",
  facebook: "https://www.facebook.com/elias.capasso",
  linkedin: "https://www.linkedin.com/in/elias-capasso",
  twitter: "https://twitter.com/EliasCapasso",
  playstore: "",
  appstore: "",
};
