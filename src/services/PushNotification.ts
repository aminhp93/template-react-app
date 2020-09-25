import toastr from 'toastr';
import * as firebase from 'firebase/app';
import 'firebase/messaging';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import * as Sentry from '@sentry/browser';
import config from 'config';
import ProfileService from 'services/Profile';
import DeviceService from 'services/Device';


const logger = new Logger(__filename);


// Wish we have TypeScript, can use interface
class BasePushNotificationService {
  // FIXME: event though push notification is not supported, we might still can
  // enable local notification, just to show nice notification in system
  supported = false;
  permission: string = localStorage.getItem('pushNotification');

  initialize(userId?: any) {
    logger.warn('Not supported');
    toastr.error('This browser does not support desktop notification');
  }
  get dismissed() {
    return true
  }

  getToken() {
    return Promise.resolve(new Error('This browser does not support desktop notification'));
  }

  async deactivateToken() {
    await Promise.reject(new Error('Not implemented'));
  }

  async activateToken() {
    await Promise.reject(new Error('Not implemented'));
  }
}


class SafariPushNotificationService extends BasePushNotificationService {
  supported = true;
  websitePushId: string;
  webServiceUrl: string;

  constructor(websitePushId: string, webServiceUrl: string) {
    super();
    this.websitePushId = websitePushId;
    this.webServiceUrl = webServiceUrl;
  }

  get dismissed() {
    const { permission } = window.safari.pushNotification.permission(this.websitePushId);
    return this.permission === 'never' || permission !== 'default';
  }

  initialize(userId) {
    return new Promise((resolve) => {
      if (this.permission === 'never') {
        resolve(this.permission);
        return;
      }

      const permission = window.safari.pushNotification.permission(this.websitePushId);
      this.requestPermission(userId, resolve, permission);
    });
  }

  requestPermission(userId, callback, data) {
    if (data.permission === 'default') {
      window.safari.pushNotification.requestPermission(
        this.webServiceUrl,
        this.websitePushId,
        // The id need to be wrapped in string, apparently Safari PN only allows strings
        { userId: `${userId}` },
        this.requestPermission.bind(this, userId, callback),
      );
      return;
    }
    logger.debug('User permission', data);
    callback(data.permission);
  }

  getToken() {
    return Promise.resolve(window.safari.pushNotification.permission(this.websitePushId).deviceToken);
  }

  async deactivateToken() {
    const registrationId = await this.getToken();
    if (registrationId === null || registrationId === undefined) {
      return;
    }
    await DeviceService.deactivateAPNSDevice(registrationId);
  }

  async activateToken() {
    const registrationId = await this.getToken();
    if (registrationId === null || registrationId === undefined) {
      return;
    }
    await DeviceService.activateAPNSDevice(registrationId);
  }
}


class FirebasePushNotificationService extends BasePushNotificationService {
  supported = true;
  config?: any;
  messaging?: any;

  constructor(fcmConfig) {
    super();

    this.config = fcmConfig;
    window.navigator.serviceWorker
      .register(`${window.location.origin}/${fcmConfig.serviceWorker}`)
      .then(registration => {
        firebase.initializeApp(fcmConfig);
        this.messaging = firebase.messaging();
        this.messaging.useServiceWorker(registration);
        this.messaging.usePublicVapidKey(fcmConfig.publicKey);
        // this.initialize().then(() => {
        //   logger.debug('Refreshed token!');
        // })
      });
  }

  private onTokenRefresh() {
    this.messaging.onTokenRefresh(() => {
      this.messaging.getToken().then((refreshedToken) => {
        logger.debug('Token refreshed.');
        // Indicate that the new Instance ID token has not yet been sent to the
        this.registerDeviceToken(refreshedToken).then(() => {
          Sentry.captureMessage(`Refreshed push notification token || ${refreshedToken}`);
          logger.debug('Token updated.');
        });
        // [END_EXCLUDE]
      }).catch((err) => {
        logger.warn('Unable to retrieve refreshed token ', err);
        Sentry.captureMessage(`Unable to retrieve refreshed token || ${err}`);
      });
    });
  }

  get dismissed() {
    return this.permission === 'never' || Notification.permission !== 'default';
  }

  initialize() {
    return new Promise((resolve) => {
      if (this.permission === 'never' || Notification.permission !== 'default') {
        resolve(this.permission || Notification.permission);
        Sentry.captureMessage(`Does not allow push notification`);
        return;
      }
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          this.messaging.getToken().then((token) => this.registerDeviceToken(token).then(() => {
            Sentry.captureMessage(`Update push notification token || ${token}`);
          })).catch((err) => {
            logger.warn('Unable to retrieve refreshed token ', err);
            Sentry.captureMessage(`Unable to retrieve refreshed token || ${err}`);
          });
          // Callback fired if Instance ID token is updated.
          this.onTokenRefresh()
        }
      }).catch((err) => {
        logger.warn('Unable to request permission ', err);
        Sentry.captureMessage(`Unable to request permission || ${err}`);
      });
    });
  }

  registerDeviceToken(token) {
    return ProfileService.registerDevice({
      registration_id: token,
      type: 'web',
    }, 'gcm');
  }

  getToken() {
    return this.messaging.getToken();
  }

  async deactivateToken() {
    const registrationId = await this.getToken();
    if (registrationId === null || registrationId === undefined) {
      return;
    }
    await DeviceService.deactivateFCMDevice(registrationId);
    this.onTokenRefresh()
  }

  async activateToken() {
    const registrationId = await this.getToken();
    if (registrationId === null || registrationId === undefined) {
      return;
    }
    await DeviceService.activateFCMDevice(registrationId);

  }
}


let implementation = new BasePushNotificationService();
if ('safari' in window && 'pushNotification' in window.safari) {
  implementation = new SafariPushNotificationService(config.apns.websitePushId, config.apns.webServiceUrl);
  logger.debug('Using SafariPushNotificationService');
} else if (firebase.messaging.isSupported()) {
  implementation = new FirebasePushNotificationService(config.fcm);
  logger.debug('Using FirebasePushNotificationService');
} else {
  logger.warn('Push notification is not supported');
  logger.debug('Using BasePushNotificationService');
}

// Hub.listen('auth', ({ payload }) => {
//   if (payload.event === 'signIn') {
//     if (implementation.supported && !implementation.dismissed) {
//       implementation.activateToken().then((res) => {
//         logger.info('Re-activate browser token SUCCEEDED', res);
//       }).catch((error) => {
//         logger.error('Re-activate browser token FAILED', error);
//       });
//     }
//   }
//   // Initialize fcm when reload
//   // if (payload.event === 'configured' && payload.data && firebase.messaging.isSupported()) {
//   //   implementation.initialize()
//   // }
// });

export default implementation;
