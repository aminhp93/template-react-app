import request from 'utils/request';
import { onBoardingUrls, getHeaders } from 'config/api';


const OnBoardingService = {
  async selectSession(data) {
    return request({
      method: 'post',
      headers: await getHeaders(),
      url: onBoardingUrls.selectSession,
      data,
    }).then((res) => res);
  },
  async updateProfile(data) {
    return request({
      method: 'put',
      headers: await getHeaders(),
      url: onBoardingUrls.updateProfile,
      data,
    }).then((res) => res);
  },
};

export default OnBoardingService;
