import request from 'utils/request';
import { deviceUrls, getHeaders } from 'config/api';

const DeviceService = {
  async activateAPNSDevice(id) {
    return request({
      method: 'put',
      headers: await getHeaders(),
      url: deviceUrls.apnsDetail(id),
    }).then((res) => res);
  },
  async deactivateAPNSDevice(id) {
    return request({
      method: 'delete',
      headers: await getHeaders(),
      url: deviceUrls.apnsDetail(id),
    }).then((res) => res);
  },
  async activateFCMDevice(id) {
    return request({
      method: 'put',
      headers: await getHeaders(),
      url: deviceUrls.fcmDetail(id),
    }).then((res) => res);
  },
  async deactivateFCMDevice(id) {
    return request({
      method: 'delete',
      headers: await getHeaders(),
      url: deviceUrls.fcmDetail(id),
    }).then((res) => res);
  },
};

export default DeviceService;
