import baseConfigs from './base';

const configs = {
  domain: 'insightdata.com',
  apiUrl: 'https://platform.insightdata.com',
  appUrl: 'https://platform.insightdata.com',
  amplitudeApiKey: '21d09fbdbca656ea69a253fb30c94b49',
  pusher: {
    key: 'a3fda83202655e2402f1',
    cluster: 'us2',
  },
  cognito: {
    region: 'us-west-2',
    userPoolId: 'us-west-2_YQjC686Ww',
    userPoolWebClientId: '1auchid2pbri4ol3o6q1n7gter',
    authenticationFlowType: 'USER_PASSWORD_AUTH',
    identityPoolId: 'us-west-2:c4aa356e-e75f-4d50-a9ce-938a2916dbfe',
  },
  s3: {
    bucket: 'insight-community-platform',
    region: 'us-west-2',
    identityPoolId: 'us-west-2:c4aa356e-e75f-4d50-a9ce-938a2916dbfe',
  },
  giphy: {
    baseUrl: 'https://api.giphy.com',
    apiKey: 'dbkE541lcslYHaPHi57Mx6a4gUxEkYHh',
  },
  sentry: {
    dsn: 'https://dc29cf4c10c44e86bc904a85613b2c72@sentry.io/1800587',
    environment: 'production',
    tracesSampleRate: 0.1,
  },
  fcm: {
    apiKey: 'AIzaSyAeDyC-y6m1Im-2ahlZmncne8-92vQ6_LU',
    authDomain: 'insight-community.firebaseapp.com',
    databaseURL: 'https://insight-community.firebaseio.com',
    projectId: 'insight-community',
    storageBucket: 'insight-community.appspot.com',
    messagingSenderId: '542469417433',
    appId: '1:542469417433:web:650f1ce048d2a609fd11c8',
    publicKey: 'BMSxAqYcbakWBzdXcQsuEpp4Ekwxql9bkoaYwiYl9bOVvSRwZwoLCkVMvlNGPpgDJ0ic84ZrIU31iF-O0obxsxg',
    serviceWorker: 'firebase-messaging-sw.production.js',
  },
  apns: {
    websitePushId: 'web.com.insightfellows.messenger',
    webServiceUrl: 'https://platform.insightdata.com/api',
  },
};

export default Object.freeze({ ...baseConfigs, ...configs });
