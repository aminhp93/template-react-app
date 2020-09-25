import baseConfigs from './base';

const configs = {
  domain: 'insightdatastaging.com',
  apiUrl: 'https://platform.insightdatastaging.com',
  appUrl: 'https://platform.insightdatastaging.com',
  amplitudeApiKey: '2a2488ffb8901f70834db12c45712885',
  pusher: {
    key: 'e369bb4610d1ca88007e',
    cluster: 'us2',
  },
  cognito: {
    region: 'us-west-2',
    userPoolId: 'us-west-2_ADCN3Ekv5',
    userPoolWebClientId: 'dgrepsn2bmu4oe4qb7t83u8le',
    authenticationFlowType: 'USER_PASSWORD_AUTH',
    identityPoolId: 'us-west-2:23167bc9-5299-4d43-bb04-5d3cd42f4dab',
  },
  s3: {
    bucket: 'insight-community-platform-staging',
    region: 'us-west-2',
    identityPoolId: 'us-west-2:23167bc9-5299-4d43-bb04-5d3cd42f4dab',
  },
  giphy: {
    baseUrl: 'https://api.giphy.com',
    apiKey: 'kpUAchw97Rwv1X2EksTaNbk1yLozq0YF',
  },
  sentry: {
    dsn: 'https://dc29cf4c10c44e86bc904a85613b2c72@sentry.io/1800587',
    environment: 'staging',
    tracesSampleRate: 0.5,
  },
  fcm: {
    apiKey: 'AIzaSyAeDyC-y6m1Im-2ahlZmncne8-92vQ6_LU',
    authDomain: 'insight-community.firebaseapp.com',
    databaseURL: 'https://insight-community.firebaseio.com',
    projectId: 'insight-community',
    storageBucket: 'insight-community.appspot.com',
    messagingSenderId: '542469417433',
    appId: '1:542469417433:web:2f59a70c46cbf088fd11c8',
    publicKey: 'BMSxAqYcbakWBzdXcQsuEpp4Ekwxql9bkoaYwiYl9bOVvSRwZwoLCkVMvlNGPpgDJ0ic84ZrIU31iF-O0obxsxg',
    serviceWorker: 'firebase-messaging-sw.staging.js',
  },
  apns: {
    websitePushId: 'web.com.insightfellows.platform-stag',
    webServiceUrl: 'https://platform.insightdatastaging.com/api',
  },
};

export default Object.freeze({ ...baseConfigs, ...configs });
