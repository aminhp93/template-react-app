import request from 'utils/request';
import { getHeaders, taggingUrl } from 'config/api';


const MentioningUserService = {
  async searchUser(value) {
    return request({
      method: 'get',
      headers: await getHeaders(),
      url: taggingUrl.searchUser(value),
    });
  },
};

export default MentioningUserService;
