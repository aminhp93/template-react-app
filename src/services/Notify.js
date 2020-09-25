import Push from 'push.js';
import _isFunction from 'lodash/isFunction';
import { NOTIFICATION } from '../utils/enums';

class Notify {
  static config = NOTIFICATION;

  static callbacks = {};

  static canPushBrowser() {
    return Push.Permission.has();
  }

  static getBrowserPermission() {
    return Push.Permission.get();
  }

  static requestBrowserPermission(onGranted, onDenied) {
    return Push.Permission.request(onGranted, onDenied);
  }

  static pushBrowser(config) {
    const {
      title, tag, body, icon, timeout, onClick,
    } = config || {};

    return Push.create(title, {
      body,
      icon: icon || this.config.BROWSER.ICON,
      timeout,
      requireInteraction: timeout === 0,
      tag,
      onClick: function handleOnClick(...rest) {
        if (_isFunction(onClick)) {
          onClick(...rest);
        }
        if (window) {
          window.focus();
        }
        this.close();
      },
    });
  }
}

export default Notify;
