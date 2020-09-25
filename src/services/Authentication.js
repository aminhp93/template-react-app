import request from 'utils/request';
import { authenticationUrls, getHeaders } from 'config/api';

const AuthenticationService = {
  async requestChangeEmail(data) {
    return request({
      method: 'post',
      headers: await getHeaders(),
      url: authenticationUrls.requestChangeEmail,
      data,
    }).then((res) => res);
  },
  async changeEmail(data) {
    return request({
      method: 'put',
      headers: await getHeaders(),
      url: authenticationUrls.changeEmail,
      data,
    }).then((res) => res);
  },
  async updateSettings(data) {
    return request({
      method: 'put',
      headers: await getHeaders(),
      url: authenticationUrls.updateSettings,
      data,
    });
  },
  async signOut(data) {
    return request({
      method: 'post',
      headers: await getHeaders(),
      url: authenticationUrls.signOut,
      data,
    });
  },
};

export default AuthenticationService;
