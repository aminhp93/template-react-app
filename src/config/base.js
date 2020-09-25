export default {
  domain: 'localhost',
  apiUrl: 'http://localhost:8080',
  appUrl: 'http://localhost:8080',
  amplitudeApiKey: '440a6cd8b7ef5d1488a80d7693aaec42',
  pusher: {
    key: '4b9997b15decb6f56705',
    cluster: 'us2',
  },
  cognito: {
    region: 'us-west-2',
    userPoolId: 'us-west-2_XqBhoSz2Y',
    userPoolWebClientId: '200v0hm8orporjaq24khm80k0n',
    authenticationFlowType: 'USER_PASSWORD_AUTH',
    identityPoolId: 'us-west-2:3bee655c-d3bd-4a33-a62a-799a61dad9d9',
  },
  s3: {
    bucket: 'insight-community-platform-staging',
    region: 'us-west-2',
    identityPoolId: 'us-west-2:3bee655c-d3bd-4a33-a62a-799a61dad9d9',
  },
  giphy: {
    baseUrl: 'http://api.giphy.com',
    apiKey: 'kpUAchw97Rwv1X2EksTaNbk1yLozq0YF',
  },
  cloudFrontEndpoint: {
    url: 'https://d1fmqsw4m8nqmd.cloudfront.net',
  },
  sentry: {
    dsn: 'https://dc29cf4c10c44e86bc904a85613b2c72@sentry.io/1800587',
    environment: 'development',
  },
  fcm: {
    apiKey: "AIzaSyAeDyC-y6m1Im-2ahlZmncne8-92vQ6_LU",
    authDomain: "insight-community.firebaseapp.com",
    databaseURL: "https://insight-community.firebaseio.com",
    projectId: "insight-community",
    storageBucket: "insight-community.appspot.com",
    messagingSenderId: "542469417433",
    appId: "1:542469417433:web:ed43a7001b69d1cdfd11c8",
    publicKey: 'BMSxAqYcbakWBzdXcQsuEpp4Ekwxql9bkoaYwiYl9bOVvSRwZwoLCkVMvlNGPpgDJ0ic84ZrIU31iF-O0obxsxg',
    serviceWorker: 'firebase-messaging-sw.development.js',
  },
  apns: {
    websitePushId: 'web.com.insightfellows.messenger',
    webServiceUrl: 'https://localhost:8000/api',
  },
  formUrls: {
    interview: 'https://insightfellows.tfaforms.net/40',
  }
};
