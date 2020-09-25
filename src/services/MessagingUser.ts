import request from 'utils/request';
import QueryString from 'utils/queryString';
import { MessagingUserUrls, UserUrls } from 'config/api';


export const MessagingUserService = {
  searchUser(data: any, params?: any) {
    return request({
      method: 'POST',
      url: MessagingUserUrls.searchUser,
      data,
      params,
      paramsSerializer: (p) => QueryString.stringify(p)
    });
  },
  updateUserStatus(data: any) {
    return request({
      method: 'POST',
      url: MessagingUserUrls.updateUserStatus,
      data
    });
  },
  updateUserSkill(userId, data) {
    return request({
      method: 'POST',
      url: UserUrls.updateUserSkill(userId),
      data
    });
  }
}
