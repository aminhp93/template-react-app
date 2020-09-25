import request from 'utils/request';
import { sessionUrls, getHeaders, filterUrls } from 'config/api';


const SessionService = {
  async checkSession(data) {
    return request({
      method: 'post',
      headers: await getHeaders(),
      url: sessionUrls.checkSession,
      data,
    }).then((res) => res);
  },
  async getAllSession() {
    return request({
      method: 'GET',
      headers: await getHeaders(),
      url: filterUrls.sessions,
    }).then((res) => res);
  },
};

export default SessionService;
