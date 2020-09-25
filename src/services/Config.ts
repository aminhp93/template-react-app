import request from 'utils/request';
import { ConfigUrls } from 'config/api';

const ConfigService = {
  fetchConfig(key: string) {
    return request({
      method: 'GET',
      url: ConfigUrls.configByKey(key),
    });
  },
};

export default ConfigService;
