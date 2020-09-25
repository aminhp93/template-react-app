import { notification } from 'antd';

export enum NetworkStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

class Network {
  static listeners = [];

  static runNetworkIndicator() {
    window.addEventListener(NetworkStatus.ONLINE, () => {
      notification.destroy();
      notification.success({
        message: 'Connected',
        duration: 4,
        placement: 'bottomLeft',
      });
      this.notifyAll(NetworkStatus.ONLINE);
    });
    window.addEventListener(NetworkStatus.OFFLINE, () => {
      notification.destroy();
      notification.error({
        message: 'You are currently offline',
        duration: null,
        placement: 'bottomLeft',
      });
      this.notifyAll(NetworkStatus.OFFLINE);
    });
  }

  static addListener(listener) {
    this.listeners.push(listener);
    return () => this.listeners.filter((l) => l !== listener);
  }

  static removeListener(listener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  static notifyAll(status) {
    this.listeners.forEach((listener) => listener(status));
  }
}

export default Network;
