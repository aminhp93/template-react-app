import request from 'utils/request';
import { NotificationUrls } from 'config/api';
import QueryString from 'utils/queryString';

const NotificationService = {
  getTeamsNotifications() {
    return request({
      method: 'GET',
      url: NotificationUrls.getTeamsNotifications,
    });
  },

  getChannelsNotifications(params?: any) {
    return request({
      method: 'GET',
      url: NotificationUrls.getChannelsNotifications,
      params,
      paramsSerializer: (p) => QueryString.stringify(p),
    });
  },

  getDMGsNotifications(params?: any) {
    return request({
      method: 'GET',
      params,
      url: NotificationUrls.getDMGsNotifications,
    });
  },

  getThreadsNotifications() {
    return request({
      method: 'GET',
      url: NotificationUrls.getThreadsNotifications,
    });
  },

  getThreadNotificationForTeam(params) {
    return request({
      method: 'GET',
      url: NotificationUrls.getThreadsNotifications,
      params,
      paramsSerializer: (p) => QueryString.stringify(p),
    });
  },

  getUserNotification(userId: number) {
    return request({
      method: 'GET',
      url: NotificationUrls.getUserNotifications(userId),
    });
  },
};

export default NotificationService;
